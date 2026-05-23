import { useRef, useEffect, useState, useCallback, useMemo, memo } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, RotateCcw, ArrowLeft } from 'lucide-react';
import type { HanziEntry, CognateResult, CharRelations } from '../data/types';
import { getCharacter, getComponentCognates, getRelations, getRelationsVersion } from '../data/hanziData';
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

type RelationType = 'differentiation' | 'antonym' | 'phonetic' | 'semantic' | 'containedBy' | 'homophone' | 'cognate' | 'component';

const RELATION_COLORS: Record<RelationType, string> = {
  differentiation: '#C23B2A',
  antonym: '#9B2226',
  phonetic: '#CA6702',
  semantic: '#2D5F8A',
  containedBy: '#6B7F5E',
  homophone: '#8B6914',
  cognate: '#A39E93',
  component: '#A39E93',
};

const RELATION_LABELS: Record<RelationType, string> = {
  differentiation: '源流分化',
  antonym: '反义',
  phonetic: '同声旁',
  semantic: '同形旁',
  containedBy: '构件包含',
  homophone: '同音',
  cognate: '共享构件',
  component: '包含',
};

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

const DEFAULT_LEGEND = [
  { color: '#C23B2A', label: 'Target Character' },
  { color: '#CA6702', label: 'Phonetic Family' },
  { color: '#2D5F8A', label: 'Semantic Family' },
  { color: '#6B7F5E', label: 'Component Of' },
  { color: '#9B2226', label: 'Antonym' },
  { color: '#8B6914', label: 'Homophone' },
];

const COMPONENT_LEGEND = [
  { color: '#C23B2A', label: 'Component' },
  { color: '#8B6914', label: 'Character' },
];

const CognateGraph = memo(function CognateGraph({
  character,
  selectedComponent = null,
  cognates = [],
  onNodeClick,
  onNodeDoubleClick,
  onComponentSelect,
  className = '',
}: CognateGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);
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

      return { nodes: allNodes, links: allLinks, legendItems: COMPONENT_LEGEND };
    } else {
      // Relations-based mode — use new multi-type relation data
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
      let nodeIdx = 0;

      const addRelated = (chars: string[], relType: RelationType, radius: number) => {
        for (const c of chars) {
          if (allNodes.length > 25) break;
          const entry = getCharacter(c);
          if (!entry) continue;
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
            sharedCount: relType === 'differentiation' ? 3 : 1,
            relationType: relType,
          });
        }
      };

      if (relations) {
        addRelated(relations.differentiations, 'differentiation', 20);
        addRelated(relations.antonyms, 'antonym', 19);
        addRelated(relations.phoneticFamily, 'phonetic', 17);
        addRelated(relations.semanticFamily, 'semantic', 16);
        addRelated(relations.containedIn, 'containedBy', 15);
        addRelated(relations.homophones, 'homophone', 13);
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
            relationType: 'cognate',
          });
          allLinks.push({
            source: 'center',
            target: id,
            sharedCount: c.sharedComponents.length,
            relationType: 'cognate',
          });
        }
      }

      return { nodes: allNodes, links: allLinks, legendItems: DEFAULT_LEGEND };
    }
  }, [character, cognates, isComponentMode, selectedComponent, dataVersion]);

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
      .attr('stroke', (d) => d.relationType ? RELATION_COLORS[d.relationType] : '#A39E93')
      .attr('stroke-width', (d) => 1 + d.sharedCount * 0.5)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-dasharray', (d) => d.relationType === 'antonym' ? '4,2' : null)
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
        if (d.type === 'component') return '#C23B2A';
        if (d.type === 'center') return '#C23B2A';
        if (d.relationType) return RELATION_COLORS[d.relationType];
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
        const def = d.entry?.definition ?? '';
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
            return sourceId === d.id || targetId === d.id ? '#C23B2A' : '#A39E93';
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
          .attr('stroke', '#A39E93')
          .attr('stroke-width', (linkD) => 1 + linkD.sharedCount * 0.5)
          .attr('stroke-opacity', 0.6);

        (nodeGroup.selectAll('circle') as d3.Selection<SVGCircleElement, SimNode, SVGGElement, unknown>)
          .transition().duration(200)
          .attr('opacity', 1);

        setTooltip({ visible: false, x: 0, y: 0, entry: null, sharedComponents: [], nodeRadius: 22 });
      })
      .on('click', (_event, d) => {
        _event.stopPropagation();
        // Allow clicking any node including center and selected component
        if (onNodeClick) {
          onNodeClick(d.character);
        }
      })
      .on('dblclick', (_event, d) => {
        _event.stopPropagation();
        if (onNodeDoubleClick) {
          onNodeDoubleClick(d.character);
        }
      });

    // Disable zoom double-click to allow node double-click
    (svg as any).on('dblclick.zoom', null);

    return () => {
      clearTimeout(settleTimer);
      simulation.stop();
      svg.selectAll('*').remove();
      svg.on('.zoom', null);
    };
  }, [nodes, links, character, onNodeClick, onNodeDoubleClick, selectedComponent]);

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
