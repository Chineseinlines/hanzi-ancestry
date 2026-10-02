import { useRef, useEffect, useState, useCallback, useMemo, memo } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, RotateCcw, ArrowLeft } from 'lucide-react';
import type { HanziEntry, CognateResult } from '../data/types';
import { getCharacter, getComponentCognates, getRelations, getRelationsVersion, getLocalizedDefinition } from '../data/hanziData';
import { useLanguage } from '../contexts/LanguageContext';
import GraphLegend from './GraphLegend';
import GraphTooltip from './GraphTooltip';

interface CognateGraphProps {
  character: string;
  selectedComponent?: string | null;
  cognates?: CognateResult[];
  onNodeClick?: (char: string) => void;
  onNodeDoubleClick?: (char: string) => void;
  onComponentSelect?: (component: string | null) => void;
  className?: string;
}

// 系联方式（对齐 AI 创编页「字源网络」的学理分类）
type RelationType =
  | 'cognate'     // 历时同源 —— 古今字、分化字（同源孳乳）
  | 'antonym'     // 反义对举
  | 'phonetic'    // 形声孳乳 —— 同声符字族
  | 'semantic'    // 意义引申 —— 同形旁 / 义类相承
  | 'component'   // 构件孳乳 —— 以该字为构件派生
  | 'loan'        // 通假假借 —— 同音借代
  | 'radical';    // 同部首

interface RelationMeta {
  /** 中文标签 */
  zh: string;
  /** 英文标签 */
  en: string;
  /** 节点与连线颜色 */
  color: string;
  /** 线型：null = 实线，其余为 stroke-dasharray */
  dash: string | null;
}

const RELATION_META: Record<RelationType, RelationMeta> = {
  cognate:   { zh: '历时同源', en: 'Chronological cognate', color: '#8B6914', dash: null },
  antonym:   { zh: '反义对举', en: 'Antonym',               color: '#9B2226', dash: '5,3' },
  phonetic:  { zh: '形声孳乳', en: 'Phonetic derivation',   color: '#6B7F5E', dash: null },
  semantic:  { zh: '意义引申', en: 'Semantic extension',     color: '#5D8AA8', dash: '2,3' },
  component: { zh: '构件孳乳', en: 'Component derivation',  color: '#2D5F8A', dash: null },
  loan:      { zh: '通假假借', en: 'Phonetic loan',          color: '#CA6702', dash: '6,3' },
  radical:   { zh: '同部首',   en: 'Same radical',           color: '#A39E93', dash: null },
};

/** 关系的学术优先级（用于连线强度与图例排序） */
const RELATION_ORDER: RelationType[] = ['cognate', 'antonym', 'phonetic', 'semantic', 'component', 'loan', 'radical'];

/** 中心/核心字颜色（对齐 LINES 朱砂 #C23B2A） */
const CORE_COLOR = '#C23B2A';
/** 构件模式中心构件颜色（孳乳蓝 #2D5F8A） */
const COMPONENT_CORE_COLOR = '#2D5F8A';

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  character: string;
  type: 'center' | 'cognate' | 'component';
  entry?: HanziEntry;
  sharedComponents: string[];
  radius: number;
  relationType?: RelationType;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  source: string | SimNode;
  target: string | SimNode;
  sharedCount: number;
  relationType?: RelationType;
}

// 稳定的空数组默认值：避免每次渲染都生成新引用，导致 useMemo 重建 nodes/links 进而整图重绘闪烁
const EMPTY_COGNATES: CognateResult[] = [];

const CognateGraph = memo(function CognateGraph({
  character,
  selectedComponent = null,
  cognates = EMPTY_COGNATES,
  onNodeClick,
  onNodeDoubleClick,
  onComponentSelect,
  className = '',
}: CognateGraphProps) {
  const { lang } = useLanguage();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);
  // 回调存入 ref，避免父组件重渲染时引用变化触发 useEffect 重跑导致整图重建闪烁
  const callbacksRef = useRef({ onNodeClick, onNodeDoubleClick });
  callbacksRef.current = { onNodeClick, onNodeDoubleClick };
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    entry: HanziEntry | null;
    sharedComponents: string[];
    nodeRadius: number;
  }>({ visible: false, x: 0, y: 0, entry: null, sharedComponents: [], nodeRadius: 22 });

  const isComponentMode = !!selectedComponent;

  // Track relations data version so useMemo rebuilds when relations load
  const [dataVersion, setDataVersion] = useState(getRelationsVersion);
  useEffect(() => {
    const check = () => {
      const v = getRelationsVersion();
      if (v !== dataVersion) setDataVersion(v);
    };
    check();
    if (dataVersion > 0) return;
    const timer = setInterval(check, 300);
    return () => clearInterval(timer);
  }, [dataVersion]);

  // Build graph data
  const { nodes, links, legendItems } = useMemo(() => {
    if (isComponentMode && selectedComponent) {
      // Component-centered mode
      const componentEntry = getCharacter(selectedComponent);
      const centerNode: SimNode = {
        id: 'center',
        character: selectedComponent,
        type: 'component',
        entry: componentEntry,
        sharedComponents: [],
        radius: 28,
      };

      const compCognates = getComponentCognates(selectedComponent, 25);
      const cognateNodes: SimNode[] = compCognates.map((c, i) => {
        const entry = getCharacter(c.character);
        return {
          id: `cognate-${i}`,
          character: c.character,
          type: 'cognate',
          entry,
          sharedComponents: [],
          radius: c.score >= 10 ? 20 : 16,
        };
      });

      const allNodes = [centerNode, ...cognateNodes];
      const allLinks: SimLink[] = cognateNodes.map((n) => ({
        source: 'center',
        target: n.id,
        sharedCount: 1,
      }));

      const legendItems = [
        { color: COMPONENT_CORE_COLOR, label: lang === 'zh' ? '构件' : 'Component' },
        { color: '#8B6914', label: lang === 'zh' ? '含此构件的字' : 'Characters containing it' },
      ];
      return { nodes: allNodes, links: allLinks, legendItems };
    } else {
      // Relations-based mode — 学理系联（历时同源／构件孳乳／形声孳乳／意义引申／通假假借）
      const centerEntry = getCharacter(character);
      const centerNode: SimNode = {
        id: 'center',
        character,
        type: 'center',
        entry: centerEntry,
        sharedComponents: [],
        radius: 25,
      };

      const relations = getRelations(character);
      const allNodes: SimNode[] = [centerNode];
      const allLinks: SimLink[] = [];
      const seenChars = new Set<string>(); // dedup: same char across relation types → 只取最高优先级类型
      let nodeIdx = 0;

      const addRelated = (chars: string[], relType: RelationType, radius: number, weight: number) => {
        for (const c of chars) {
          if (allNodes.length > 40) break;
          if (seenChars.has(c)) continue;
          const entry = getCharacter(c);
          if (!entry) continue;
          seenChars.add(c);
          const id = `rel-${nodeIdx++}`;
          allNodes.push({
            id,
            character: c,
            type: 'cognate',
            entry,
            sharedComponents: [],
            radius,
            relationType: relType,
          });
          allLinks.push({
            source: 'center',
            target: id,
            sharedCount: weight,
            relationType: relType,
          });
        }
      };

      if (relations) {
        addRelated(relations.differentiations, 'cognate', 21, 3);   // 历时同源（古今字／分化字）
        addRelated(relations.antonyms, 'antonym', 19, 2);           // 反义对举
        addRelated(relations.phoneticFamily, 'phonetic', 17, 2);    // 形声孳乳（同声符字族）
        addRelated(relations.semanticFamily, 'semantic', 17, 2);    // 意义引申（同形旁／义类）
        addRelated(relations.containedIn, 'component', 17, 2);      // 构件孳乳（以该字为构件）
        addRelated(relations.sharedComponents, 'component', 15, 1); // 构件孳乳（共享构件）
        addRelated(relations.homophones, 'loan', 14, 1);            // 通假假借（同音）
        addRelated(relations.nearHomophones, 'loan', 12, 1);        // 通假假借（近音）
        addRelated(relations.radicalFamily, 'radical', 13, 1);      // 同部首
      }

      // Fallback to old cognate data if no relations found
      if (allNodes.length === 1 && cognates.length > 0) {
        for (const c of cognates.slice(0, 20)) {
          const entry = getCharacter(c.character);
          if (!entry) continue;
          const id = `cog-${nodeIdx++}`;
          allNodes.push({
            id,
            character: c.character,
            type: 'cognate',
            entry,
            sharedComponents: c.sharedComponents,
            radius: c.sharedComponents.length >= 2 ? 18 : 15,
            relationType: 'component',
          });
          allLinks.push({
            source: 'center',
            target: id,
            sharedCount: c.sharedComponents.length,
            relationType: 'component',
          });
        }
      }

      // 图例只列出本网络真实出现的系联方式，并首项标注中心字
      const presentTypes = RELATION_ORDER.filter((rt) => allLinks.some((l) => l.relationType === rt));
      const legendItems = [
        { color: CORE_COLOR, label: lang === 'zh' ? '目标字（本字）' : 'Core character' },
        ...presentTypes.map((rt) => ({ color: RELATION_META[rt].color, label: RELATION_META[rt][lang] })),
      ];

      return { nodes: allNodes, links: allLinks, legendItems };
    }
  }, [character, cognates, isComponentMode, selectedComponent, dataVersion, lang]);

  const handleZoomIn = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current)
      .transition().duration(300)
      .call(zoomRef.current.scaleBy, 1.4);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current)
      .transition().duration(300)
      .call(zoomRef.current.scaleBy, 0.7);
  }, []);

  const handleReset = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current)
      .transition().duration(500)
      .call(zoomRef.current.transform, d3.zoomIdentity);
  }, []);

  const handleBack = useCallback(() => {
    onComponentSelect?.(null);
  }, [onComponentSelect]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    if (nodes.length <= 1) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.attr('width', width).attr('height', height);

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // Force simulation
    const simulation = d3.forceSimulation<SimNode>(nodes)
      .force('link', d3.forceLink<SimNode, SimLink>(links)
        .id((d) => d.id)
        .distance((d) => 100 - (d.sharedCount * 10))
        .strength(0.5)
      )
      .force('charge', d3.forceManyBody<SimNode>().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<SimNode>().radius((d) => d.radius + 10))
      .force('radial', d3.forceRadial<SimNode>(
        (d) => (d.type === 'center' || d.type === 'component' ? 0 : 140),
        width / 2,
        height / 2
      ).strength(0.3));

    simulationRef.current = simulation;

    // Draw links
    const linkSelection = g.selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', (d) => d.relationType ? RELATION_META[d.relationType].color : '#A39E93')
      .attr('stroke-width', (d) => 1 + d.sharedCount * 0.5)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-dasharray', (d) => (d.relationType ? RELATION_META[d.relationType].dash : null))
      .attr('opacity', 0);

    // Draw node groups
    const nodeGroup = g.selectAll('.node-group')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .attr('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, SimNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Node circles
    nodeGroup.append('circle')
      .attr('r', 0) // start at 0 for animation
      .attr('fill', (d) => {
        if (d.type === 'component') return COMPONENT_CORE_COLOR;
        if (d.type === 'center') return CORE_COLOR;
        if (d.relationType) return RELATION_META[d.relationType].color;
        return '#8B6914';
      })
      .attr('stroke', '#1A1A18')
      .attr('stroke-width', (d) => (d.type === 'center' || d.type === 'component' ? 3 : 2))
      .style('filter', 'drop-shadow(0 2px 6px rgba(26,26,24,0.2))');

    // Node labels (character)
    nodeGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-family', '"Noto Serif SC", serif')
      .attr('font-weight', '700')
      .attr('font-size', (d) => `${Math.max(d.radius * 0.8, 10)}px`)
      .attr('fill', '#FFFFFF')
      .attr('pointer-events', 'none')
      .attr('opacity', 0)
      .text((d) => d.character);

    // Definition labels
    nodeGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.radius + 14)
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-weight', '500')
      .attr('font-size', '9px')
      .attr('fill', '#3D3D3B')
      .attr('pointer-events', 'none')
      .attr('opacity', 0)
      .text((d) => {
        const def = getLocalizedDefinition(d.entry, lang);
        return def.length > 18 ? def.slice(0, 18) + '...' : def;
      });

    // Entrance animation: scale in circles
    (nodeGroup.selectAll('circle') as d3.Selection<SVGCircleElement, SimNode, SVGGElement, unknown>)
      .transition()
      .duration(600)
      .delay((_d, i) => (i === 0 ? 0 : 100 + i * 50))
      .ease(d3.easeBackOut.overshoot(1.2))
      .attr('r', (d) => d.radius);

    // Fade in labels
    nodeGroup.selectAll('text')
      .transition()
      .duration(400)
      .delay((_d, i) => (i === 0 ? 200 : 300 + i * 50))
      .attr('opacity', 1);

    // Fade in links
    linkSelection.transition()
      .duration(400)
      .delay(400)
      .attr('opacity', 1);

    // Tick function
    simulation.on('tick', () => {
      linkSelection
        .attr('x1', (d) => (typeof d.source === 'string' ? 0 : (d.source.x ?? 0)))
        .attr('y1', (d) => (typeof d.source === 'string' ? 0 : (d.source.y ?? 0)))
        .attr('x2', (d) => (typeof d.target === 'string' ? 0 : (d.target.x ?? 0)))
        .attr('y2', (d) => (typeof d.target === 'string' ? 0 : (d.target.y ?? 0)));

      nodeGroup.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // Stop simulation after it settles
    const settleTimer = setTimeout(() => {
      simulation.stop();
    }, 3000);

    // Interactivity
    nodeGroup
      .on('mouseenter', function (_event, d) {
        d3.select(this).select('circle')
          .transition().duration(200)
          .attr('r', d.radius * 1.15);

        // Highlight connected links
        linkSelection
          .attr('stroke', (linkD) => {
            const sourceId = typeof linkD.source === 'string' ? linkD.source : linkD.source.id;
            const targetId = typeof linkD.target === 'string' ? linkD.target : linkD.target.id;
            if (sourceId === d.id || targetId === d.id) return '#C23B2A';
            return linkD.relationType ? RELATION_META[linkD.relationType].color : '#A39E93';
          })
          .attr('stroke-width', (linkD) => {
            const sourceId = typeof linkD.source === 'string' ? linkD.source : linkD.source.id;
            const targetId = typeof linkD.target === 'string' ? linkD.target : linkD.target.id;
            return sourceId === d.id || targetId === d.id ? 2.5 : 1 + linkD.sharedCount * 0.5;
          })
          .attr('stroke-opacity', (linkD) => {
            const sourceId = typeof linkD.source === 'string' ? linkD.source : linkD.source.id;
            const targetId = typeof linkD.target === 'string' ? linkD.target : linkD.target.id;
            return sourceId === d.id || targetId === d.id ? 1 : 0.3;
          });

        // Dim other nodes
        (nodeGroup.selectAll('circle') as d3.Selection<SVGCircleElement, SimNode, SVGGElement, unknown>)
          .transition().duration(200)
          .attr('opacity', (nd) => {
            if (nd.id === d.id) return 1;
            const isConnected = links.some((l) => {
              const sId = typeof l.source === 'string' ? l.source : (l.source as SimNode).id;
              const tId = typeof l.target === 'string' ? l.target : (l.target as SimNode).id;
              return (sId === d.id && tId === nd.id) || (tId === d.id && sId === nd.id);
            });
            return isConnected ? 1 : 0.4;
          });

        // Use circle element's viewport position for tooltip
        const circleEl = d3.select(this).select('circle').node() as SVGCircleElement | null;
        if (circleEl && d.entry) {
          const cr = circleEl.getBoundingClientRect();
          const cx = cr.left + cr.width / 2;
          const cy = cr.top + cr.height / 2;
          setTooltip({
            visible: true,
            x: cx,
            y: cy,
            entry: d.entry,
            sharedComponents: d.sharedComponents,
            nodeRadius: d.radius + 4,
          });
        }
      })
      .on('mouseleave', function (_event, d) {
        d3.select(this).select('circle')
          .transition().duration(200)
          .attr('r', d.radius);

        linkSelection
          .attr('stroke', (linkD) => linkD.relationType ? RELATION_META[linkD.relationType].color : '#A39E93')
          .attr('stroke-width', (linkD) => 1 + linkD.sharedCount * 0.5)
          .attr('stroke-opacity', 0.6)
          .attr('stroke-dasharray', (linkD) => (linkD.relationType ? RELATION_META[linkD.relationType].dash : null));

        (nodeGroup.selectAll('circle') as d3.Selection<SVGCircleElement, SimNode, SVGGElement, unknown>)
          .transition().duration(200)
          .attr('opacity', 1);

        setTooltip({ visible: false, x: 0, y: 0, entry: null, sharedComponents: [], nodeRadius: 22 });
      })
      .on('click', (_event, d) => {
        _event.stopPropagation();
        // Allow clicking any node including center and selected component
        callbacksRef.current.onNodeClick?.(d.character);
      })
      .on('dblclick', (_event, d) => {
        _event.stopPropagation();
        callbacksRef.current.onNodeDoubleClick?.(d.character);
      });

    // Disable zoom double-click to allow node double-click
    (svg as any).on('dblclick.zoom', null);

    return () => {
      clearTimeout(settleTimer);
      simulation.stop();
      svg.selectAll('*').remove();
      svg.on('.zoom', null);
    };
  }, [nodes, links, character, selectedComponent, lang]);

  if (nodes.length <= 1) {
    return (
      <div className={`flex h-full w-full flex-col items-center justify-center rounded-lg bg-white ${className}`}>
        <p className="text-sm text-charcoal/60" style={{ fontFamily: 'Inter, sans-serif' }}>
          {isComponentMode
            ? `No characters found containing ${selectedComponent}.`
            : 'No cognates found for this character.'}
        </p>
        {isComponentMode && (
          <button
            onClick={handleBack}
            className="mt-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-cinnabar transition-colors hover:bg-cinnabar/10"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <ArrowLeft size={14} />
            Back to {character}
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative h-full w-full overflow-hidden rounded-lg bg-white ${className}`}>
      {/* Back button for component mode */}
      {isComponentMode && (
        <button
          onClick={handleBack}
          className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-cinnabar shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
          style={{ border: '1px solid var(--border-light)', fontFamily: 'Inter, sans-serif' }}
        >
          <ArrowLeft size={14} />
          Back to {character}
        </button>
      )}
      <svg
        ref={svgRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      <GraphLegend items={legendItems} />
      {/* Controls */}
      <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          className="flex h-8 w-8 items-center justify-center rounded bg-white shadow-sm transition-colors hover:bg-bg-warm"
          style={{ border: '1px solid var(--border-light)' }}
          aria-label="Zoom in"
        >
          <ZoomIn size={16} className="text-charcoal" />
        </button>
        <button
          onClick={handleZoomOut}
          className="flex h-8 w-8 items-center justify-center rounded bg-white shadow-sm transition-colors hover:bg-bg-warm"
          style={{ border: '1px solid var(--border-light)' }}
          aria-label="Zoom out"
        >
          <ZoomOut size={16} className="text-charcoal" />
        </button>
        <button
          onClick={handleReset}
          className="flex h-8 w-8 items-center justify-center rounded bg-white shadow-sm transition-colors hover:bg-bg-warm"
          style={{ border: '1px solid var(--border-light)' }}
          aria-label="Reset view"
        >
          <RotateCcw size={16} className="text-charcoal" />
        </button>
      </div>
      <GraphTooltip
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
        entry={tooltip.entry}
        sharedComponents={tooltip.sharedComponents}
        nodeRadius={tooltip.nodeRadius}
      />
    </div>
  );
});

export default CognateGraph;
