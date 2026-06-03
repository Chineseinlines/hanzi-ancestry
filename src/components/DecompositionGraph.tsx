import { useRef, useEffect, useState, useCallback, memo } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import type { DecompositionNode, HanziEntry } from '../data/types';
import { getCharacter } from '../data/hanziData';
import { ratePhonetic, PHONETIC_COLORS, type PhoneticRating } from '../data/phoneticRating';
import { getGhostAnnotation } from '../data/ghostComponents';
import GraphLegend from './GraphLegend';
import GraphTooltip from './GraphTooltip';

interface DecompositionGraphProps {
  decomposition: DecompositionNode;
  onNodeClick?: (char: string) => void;
  onNodeDoubleClick?: (char: string) => void;
  onComponentClick?: (comp: string) => void;
  selectableComponents?: string[];
  highlightedComponent?: string | null;
  className?: string;
}

interface TreeNode {
  id: string;
  character: string;
  type: 'core' | 'semantic' | 'phonetic' | 'ideographic' | 'leaf' | 'ghost';
  depth: number;
  entry?: HanziEntry;
  children?: TreeNode[];
  x?: number;
  y?: number;
  phoneticRating?: PhoneticRating | null;
  isGhost?: boolean;
}

interface TreeLink {
  source: TreeNode;
  target: TreeNode;
}

const CORE_COLOR = '#C23B2A';
const SEMANTIC_COLOR = '#2D5F8A';
const PHONETIC_COLOR = '#C47B2A';
const IDEOGRAPHIC_COLOR = '#8B6914';

const GHOST_COLOR = '#B0ADA5';

const LEGEND_ITEMS = [
  { color: CORE_COLOR, label: 'Target character', shape: 'circle' as const },
  { color: SEMANTIC_COLOR, label: 'Semantic (meaning) 表意', shape: 'circle' as const },
  { color: PHONETIC_COLOR, label: 'Phonetic (sound) 表音', shape: 'diamond' as const },
  { color: IDEOGRAPHIC_COLOR, label: 'Ideographic component', shape: 'circle' as const },
  { color: GHOST_COLOR, label: 'Simplified ghost 简体衍生', shape: 'circle' as const },
];

function decompToTree(node: DecompositionNode, depth = 0): TreeNode {
  const entry = getCharacter(node.character);
  const ety = entry?.etymology;

  let type: TreeNode['type'] = 'leaf';
  if (depth === 0) {
    type = 'core';
  } else if (ety?.type === 'pictophonetic') {
    // Determine if this child node is semantic or phonetic based on parent
    // We'll set this after building the tree in a second pass
    type = 'leaf';
  } else if (ety?.type === 'ideographic') {
    type = 'ideographic';
  }

  const treeNode: TreeNode = {
    id: `${node.character}-${depth}-${Math.random().toString(36).slice(2, 6)}`,
    character: node.character,
    type,
    depth,
    entry,
    children: node.children.length > 0
      ? node.children.map((c) => decompToTree(c, depth + 1))
      : undefined,
  };

  return treeNode;
}

// Post-process: set semantic/phonetic labels based on parent's etymology
function annotateTypes(root: TreeNode): void {
  const rootEntry = root.entry;
  const ety = rootEntry?.etymology;
  if (!ety || !root.children || root.children.length === 0) return;

  const semantic = ety.semantic;
  const phonetic = ety.phonetic;
  const rootPinyin = rootEntry?.pinyin?.[0];

  for (const child of root.children) {
    if (ety.type === 'pictophonetic') {
      if (child.character === semantic) child.type = 'semantic';
      else if (child.character === phonetic) {
        child.type = 'phonetic';
        // Compute phonetic reliability rating
        if (rootPinyin && child.entry?.pinyin?.[0]) {
          const result = ratePhonetic(rootPinyin, child.entry.pinyin[0]);
          child.phoneticRating = result?.rating ?? null;
        }
      }
    } else if (ety.type === 'ideographic') {
      child.type = 'ideographic';
    }

    // Check if child is a ghost component (simplified artifact)
    const ghostAnnotation = getGhostAnnotation(child.character);
    if (ghostAnnotation) {
      child.isGhost = true;
    }
  }
}

function getNodeRadius(type: TreeNode['type']): number {
  switch (type) {
    case 'core': return 30;
    case 'semantic': return 24;
    case 'phonetic': return 24;
    case 'ideographic': return 22;
    case 'ghost': return 20;
    case 'leaf': return 20;
    default: return 20;
  }
}

function getNodeColor(type: TreeNode['type'], isHighlighted: boolean): string {
  if (isHighlighted) return '#C23B2A';
  switch (type) {
    case 'core': return CORE_COLOR;
    case 'semantic': return SEMANTIC_COLOR;
    case 'phonetic': return PHONETIC_COLOR;
    case 'ideographic': return IDEOGRAPHIC_COLOR;
    case 'ghost': return GHOST_COLOR;
    case 'leaf': return '#EDE6D8';
    default: return '#A39E93';
  }
}

function getNodeStrokeColor(type: TreeNode['type'], phoneticRating?: PhoneticRating | null): string {
  if (type === 'ghost') return GHOST_COLOR;
  if (type === 'phonetic' && phoneticRating) {
    const colors = PHONETIC_COLORS[phoneticRating];
    return colors.text;
  }
  return '#1A1A18';
}

function getNodeStrokeWidth(type: TreeNode['type'], phoneticRating?: PhoneticRating | null): number {
  if (type === 'phonetic' && phoneticRating) return 3;
  if (type === 'ghost') return 1.5;
  return type === 'core' ? 3 : 2;
}

function getTextColor(type: TreeNode['type']): string {
  return (type === 'leaf' || type === 'ghost') ? '#1A1A18' : '#FFFFFF';
}

function getNodeLabel(type: TreeNode['type'], phoneticRating?: PhoneticRating | null): string {
  switch (type) {
    case 'semantic': return '形';
    case 'phonetic':
      if (phoneticRating) {
        return phoneticRating === 'green' ? '声✓' : phoneticRating === 'yellow' ? '声~' : '声✗';
      }
      return '声';
    default: return '';
  }
}

const DecompositionGraph = memo(function DecompositionGraph({
  decomposition,
  onNodeClick,
  onNodeDoubleClick,
  onComponentClick,
  selectableComponents = [],
  highlightedComponent = null,
  className = '',
}: DecompositionGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  // Store callbacks in refs so the D3 effect doesn't re-run on every render
  const callbacksRef = useRef({ onNodeClick, onNodeDoubleClick, onComponentClick });
  callbacksRef.current = { onNodeClick, onNodeDoubleClick, onComponentClick };
  const highlightedRef = useRef(highlightedComponent);
  highlightedRef.current = highlightedComponent;
  const selectableRef = useRef(selectableComponents);
  selectableRef.current = selectableComponents;
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    entry: HanziEntry | null;
    nodeRadius: number;
    nodeType?: TreeNode['type'];
    phoneticRating?: PhoneticRating | null;
    isGhost?: boolean;
  }>({ visible: false, x: 0, y: 0, entry: null, nodeRadius: 22 });

  const handleZoomIn = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.4);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 0.7);
  }, []);

  const handleReset = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.attr('width', width).attr('height', height);

    const g = svg.append('g');

    // Build tree
    const root = decompToTree(decomposition);
    annotateTypes(root);

    // Layout: core at top center, children in a row below
    const centerX = width / 2;
    const topY = 90;
    const childY = topY + 140;

    root.x = centerX;
    root.y = topY;

    const allNodes: TreeNode[] = [root];
    const allLinks: TreeLink[] = [];

    if (root.children && root.children.length > 0) {
      const childCount = root.children.length;
      const childSpacing = Math.min(160, (width - 100) / childCount);
      const childRowWidth = (childCount - 1) * childSpacing;
      const childStartX = centerX - childRowWidth / 2;

      root.children.forEach((child, i) => {
        child.x = childStartX + i * childSpacing;
        child.y = childY;
        allNodes.push(child);
        allLinks.push({ source: root, target: child });
      });
    }

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => { g.attr('transform', event.transform); });
    zoomRef.current = zoom;
    svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

    // Etymology label above center
    const rootEntry = root.entry;
    const ety = rootEntry?.etymology;
    if (ety) {
      const typeLabel = ety.type === 'pictophonetic' ? '形声字 (Phono-semantic)'
        : ety.type === 'ideographic' ? '会意字 (Compound Ideograph)'
        : ety.type === 'pictographic' ? '象形字 (Pictograph)'
        : ety.type === 'indicative' ? '指事字 (Indicative)' : '';

      g.append('text')
        .attr('x', centerX)
        .attr('y', 28)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'Inter, sans-serif')
        .attr('font-size', '11px')
        .attr('fill', '#8B6914')
        .text(typeLabel);

      if (ety.hint) {
        g.append('text')
          .attr('x', centerX)
          .attr('y', 48)
          .attr('text-anchor', 'middle')
          .attr('font-family', 'Inter, sans-serif')
          .attr('font-size', '10px')
          .attr('fill', '#A39E93')
          .text(ety.hint.length > 40 ? ety.hint.slice(0, 40) + '...' : ety.hint);
      }
    }

    // Draw links
    const linkSelection = g.selectAll('.link')
      .data(allLinks)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#A39E93')
      .attr('stroke-width', 2)
      .attr('opacity', 0)
      .attr('d', (d) => {
        const sx = d.source.x ?? 0;
        const sy = d.source.y ?? 0;
        const tx = d.target.x ?? 0;
        const ty = d.target.y ?? 0;
        const midY = (sy + ty) / 2;
        return `M${sx},${sy} C${sx},${midY} ${tx},${midY} ${tx},${ty}`;
      });

    // Draw nodes
    const nodeGroup = g.selectAll('.node-group')
      .data(allNodes)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .attr('cursor', 'pointer')
      .attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0}) scale(0)`);

    const isNodeHighlighted = (d: TreeNode): boolean => {
      return highlightedComponent === d.character && d.depth > 0;
    };

    // Node shapes — phonetic uses diamond for color-blind friendliness; ghost uses dashed
    nodeGroup.each(function (d) {
      const el = d3.select(this);
      const r = getNodeRadius(d.type);
      const hl = isNodeHighlighted(d);
      const color = getNodeColor(d.type, hl);
      const strokeClr = getNodeStrokeColor(d.type, d.phoneticRating);
      const strokeW = getNodeStrokeWidth(d.type, d.phoneticRating);

      if (d.type === 'phonetic') {
        // Diamond shape (rotated square) for phonetic nodes
        el.append('polygon')
          .attr('points', `0,${-r} ${r},0 0,${r} ${-r},0`)
          .attr('fill', color)
          .attr('stroke', strokeClr)
          .attr('stroke-width', strokeW)
          .attr('stroke-dasharray', d.isGhost ? '4,3' : 'none')
          .style('filter', 'drop-shadow(0 2px 6px rgba(26,26,24,0.18))');
      } else {
        el.append('circle')
          .attr('r', r)
          .attr('fill', color)
          .attr('stroke', strokeClr)
          .attr('stroke-width', strokeW)
          .attr('stroke-dasharray', d.isGhost ? '4,3' : 'none')
          .style('filter', 'drop-shadow(0 2px 6px rgba(26,26,24,0.18))');
      }
    });

    // Character labels
    nodeGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-family', '"Noto Serif SC", serif')
      .attr('font-weight', '700')
      .attr('font-size', (d) => {
        const r = getNodeRadius(d.type);
        return `${Math.max(r * 0.65, 11)}px`;
      })
      .attr('fill', (d) => getTextColor(d.type))
      .attr('pointer-events', 'none')
      .text((d) => d.character);

    // Type badges (形/声) — with phonetic rating color
    nodeGroup.filter((d) => d.type === 'semantic' || d.type === 'phonetic')
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => -getNodeRadius(d.type) - 8)
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-weight', '600')
      .attr('font-size', '10px')
      .attr('fill', (d) => {
        if (d.type === 'phonetic' && d.phoneticRating) {
          return PHONETIC_COLORS[d.phoneticRating].text;
        }
        return d.type === 'semantic' ? SEMANTIC_COLOR : PHONETIC_COLOR;
      })
      .text((d) => getNodeLabel(d.type, d.phoneticRating));

    // Definition labels (or ghost warning for ghost nodes)
    nodeGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => getNodeRadius(d.type) + 16)
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-weight', '500')
      .attr('font-size', '9px')
      .attr('fill', (d) => d.isGhost ? '#A39E93' : '#3D3D3B')
      .attr('pointer-events', 'none')
      .text((d) => {
        if (d.isGhost) return '← 无造字意义';
        const def = d.entry?.definition ?? '';
        return def.length > 20 ? def.slice(0, 20) + '...' : def;
      });

    // Animations
    nodeGroup.transition()
      .duration(500)
      .delay((_d, i) => i * 120)
      .ease(d3.easeBackOut)
      .attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0}) scale(1)`);

    linkSelection.transition()
      .duration(400)
      .delay(300)
      .attr('opacity', 1);

    // Interactivity
    nodeGroup
      .on('mouseenter', function (_event, d) {
        const r = getNodeRadius(d.type);
        const shapeEl = d3.select(this).select('circle, polygon');
        if (d.type === 'phonetic') {
          shapeEl.transition().duration(200)
            .attr('points', `0,${-r * 1.15} ${r * 1.15},0 0,${r * 1.15} ${-r * 1.15},0`);
        } else {
          shapeEl.transition().duration(200)
            .attr('r', r * 1.15);
        }

        const shapeNode = d3.select(this).select('circle, polygon').node() as SVGCircleElement | SVGPolygonElement | null;
        if (shapeNode && d.entry) {
          const cr = shapeNode.getBoundingClientRect();
          setTooltip({
            visible: true,
            x: cr.left + cr.width / 2,
            y: cr.top + cr.height / 2,
            entry: d.entry,
            nodeRadius: r + 4,
            nodeType: d.type,
            phoneticRating: d.phoneticRating ?? null,
            isGhost: d.isGhost ?? false,
          });
        }
      })
      .on('mouseleave', function (_event, d) {
        const r = getNodeRadius(d.type);
        const shapeEl = d3.select(this).select('circle, polygon');
        if (d.type === 'phonetic') {
          shapeEl.transition().duration(200)
            .attr('points', `0,${-r} ${r},0 0,${r} ${-r},0`);
        } else {
          shapeEl.transition().duration(200)
            .attr('r', r);
        }
        setTooltip({ visible: false, x: 0, y: 0, entry: null, nodeRadius: 22 });
      })
      .on('click', (_event, d) => {
        _event.stopPropagation();
        const { onNodeClick: clk, onComponentClick: compClk } = callbacksRef.current;
        if (d.depth > 0 && compClk) {
          compClk(d.character);
        } else if (clk) {
          clk(d.character);
        }
      })
      .on('dblclick', (_event, d) => {
        _event.stopPropagation();
        callbacksRef.current.onNodeDoubleClick?.(d.character);
      });

    svg.on('dblclick.zoom', () => {
      svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
    });

    return () => {
      svg.selectAll('*').remove();
      svg.on('.zoom', null);
    };
  }, [decomposition]);

  return (
    <div ref={containerRef} className={`relative h-full w-full overflow-hidden rounded-lg bg-white ${className}`}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <GraphLegend items={LEGEND_ITEMS} />
      <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1">
        <button onClick={handleZoomIn} className="flex h-8 w-8 items-center justify-center rounded bg-white shadow-sm transition-colors hover:bg-bg-warm" style={{ border: '1px solid var(--border-light)' }} aria-label="Zoom in">
          <ZoomIn size={16} className="text-charcoal" />
        </button>
        <button onClick={handleZoomOut} className="flex h-8 w-8 items-center justify-center rounded bg-white shadow-sm transition-colors hover:bg-bg-warm" style={{ border: '1px solid var(--border-light)' }} aria-label="Zoom out">
          <ZoomOut size={16} className="text-charcoal" />
        </button>
        <button onClick={handleReset} className="flex h-8 w-8 items-center justify-center rounded bg-white shadow-sm transition-colors hover:bg-bg-warm" style={{ border: '1px solid var(--border-light)' }} aria-label="Reset view">
          <RotateCcw size={16} className="text-charcoal" />
        </button>
      </div>
      <GraphTooltip
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
        entry={tooltip.entry}
        nodeRadius={tooltip.nodeRadius}
        nodeType={tooltip.nodeType}
        phoneticRating={tooltip.phoneticRating}
        isGhost={tooltip.isGhost}
      />
    </div>
  );
});

export default DecompositionGraph;
