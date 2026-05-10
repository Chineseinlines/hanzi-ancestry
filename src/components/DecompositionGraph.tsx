import { useRef, useEffect, useState, useCallback, memo } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import type { DecompositionNode, HanziEntry } from '../data/types';
import { getCharacter } from '../data/hanziData';
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
  type: 'core' | 'semantic' | 'phonetic' | 'ideographic' | 'leaf';
  depth: number;
  entry?: HanziEntry;
  children?: TreeNode[];
  x?: number;
  y?: number;
}

interface TreeLink {
  source: TreeNode;
  target: TreeNode;
}

const CORE_COLOR = '#C23B2A';
const SEMANTIC_COLOR = '#2D5F8A';
const PHONETIC_COLOR = '#6B7F5E';
const IDEOGRAPHIC_COLOR = '#8B6914';

const LEGEND_ITEMS = [
  { color: CORE_COLOR, label: 'Target character' },
  { color: SEMANTIC_COLOR, label: 'Semantic (meaning)' },
  { color: PHONETIC_COLOR, label: 'Phonetic (sound)' },
  { color: IDEOGRAPHIC_COLOR, label: 'Ideographic component' },
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

  for (const child of root.children) {
    if (ety.type === 'pictophonetic') {
      if (child.character === semantic) child.type = 'semantic';
      else if (child.character === phonetic) child.type = 'phonetic';
    } else if (ety.type === 'ideographic') {
      child.type = 'ideographic';
    }
  }
}

function getNodeRadius(type: TreeNode['type']): number {
  switch (type) {
    case 'core': return 30;
    case 'semantic': return 24;
    case 'phonetic': return 24;
    case 'ideographic': return 22;
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
    case 'leaf': return '#EDE6D8';
    default: return '#A39E93';
  }
}

function getTextColor(type: TreeNode['type']): string {
  return type === 'leaf' ? '#1A1A18' : '#FFFFFF';
}

function getNodeLabel(type: TreeNode['type']): string {
  switch (type) {
    case 'semantic': return '形';
    case 'phonetic': return '声';
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
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    entry: HanziEntry | null;
    nodeRadius: number;
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
    const topY = 70;
    const childY = topY + 130;

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
        .attr('y', 24)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'Inter, sans-serif')
        .attr('font-size', '11px')
        .attr('fill', '#8B6914')
        .text(typeLabel);

      if (ety.hint) {
        g.append('text')
          .attr('x', centerX)
          .attr('y', 42)
          .attr('text-anchor', 'middle')
          .attr('font-family', 'Inter, sans-serif')
          .attr('font-size', '10px')
          .attr('fill', '#A39E93')
          .text(ety.hint.length > 60 ? ety.hint.slice(0, 60) + '...' : ety.hint);
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

    // Circles
    nodeGroup.append('circle')
      .attr('r', (d) => getNodeRadius(d.type))
      .attr('fill', (d) => getNodeColor(d.type, isNodeHighlighted(d)))
      .attr('stroke', (d) => isNodeHighlighted(d) ? '#C23B2A' : '#1A1A18')
      .attr('stroke-width', (d) => isNodeHighlighted(d) ? 3 : d.type === 'core' ? 3 : 2)
      .style('filter', 'drop-shadow(0 2px 6px rgba(26,26,24,0.18))');

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

    // Type badges (形/声)
    nodeGroup.filter((d) => d.type === 'semantic' || d.type === 'phonetic')
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => -getNodeRadius(d.type) - 8)
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-weight', '600')
      .attr('font-size', '10px')
      .attr('fill', (d) => d.type === 'semantic' ? SEMANTIC_COLOR : PHONETIC_COLOR)
      .text((d) => getNodeLabel(d.type));

    // Definition labels
    nodeGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => getNodeRadius(d.type) + 16)
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-weight', '500')
      .attr('font-size', '9px')
      .attr('fill', '#3D3D3B')
      .attr('pointer-events', 'none')
      .text((d) => {
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
        d3.select(this).select('circle')
          .transition().duration(200)
          .attr('r', getNodeRadius(d.type) * 1.15);

        const circleEl = d3.select(this).select('circle').node() as SVGCircleElement | null;
        const r = getNodeRadius(d.type);
        if (circleEl && d.entry) {
          const cr = circleEl.getBoundingClientRect();
          setTooltip({
            visible: true,
            x: cr.left + cr.width / 2,
            y: cr.top + cr.height / 2,
            entry: d.entry,
            nodeRadius: r + 4,
          });
        }
      })
      .on('mouseleave', function (_event, d) {
        d3.select(this).select('circle')
          .transition().duration(200)
          .attr('r', getNodeRadius(d.type));
        setTooltip({ visible: false, x: 0, y: 0, entry: null, nodeRadius: 22 });
      })
      .on('click', (_event, d) => {
        _event.stopPropagation();
        if (d.depth > 0 && onComponentClick) {
          onComponentClick(d.character);
        } else if (onNodeClick) {
          onNodeClick(d.character);
        }
      })
      .on('dblclick', (_event, d) => {
        _event.stopPropagation();
        if (onNodeDoubleClick) onNodeDoubleClick(d.character);
      });

    svg.on('dblclick.zoom', () => {
      svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
    });

    return () => {
      svg.selectAll('*').remove();
      svg.on('.zoom', null);
    };
  }, [decomposition, onNodeClick, onNodeDoubleClick, onComponentClick, selectableComponents, highlightedComponent]);

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
        onExplore={onNodeClick ?? undefined}
      />
    </div>
  );
});

export default DecompositionGraph;
