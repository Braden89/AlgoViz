import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Graph, SearchStep, EdgeId } from "../algorithms/search/searchtypes";

function edgeId(from: string, to: string, directed: boolean): EdgeId {
  if (directed) return `${from}->${to}`;
  return from < to ? `${from}--${to}` : `${to}--${from}`;
}



export function GraphView(props: { graph?: Graph; step?: SearchStep }) {
  const { graph, step } = props;

  // View-only zoom + pan (does not modify points)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const isPanningRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);

  if (!graph || Object.keys(graph.nodes).length === 0) {
    return <div className="text-sm text-zinc-400">Graph is empty.</div>;
  }

  const nodes = graph.nodes;
  const edges = graph.edges;

    const graphKey = useMemo(() => {
    // changes whenever nodes/edges change
    const nodeCount = Object.keys(nodes).length;
    const edgeCount = edges.length;
    // include bounds-ish signal too
    const sample = Object.values(nodes)
      .slice(0, 3)
      .map((n) => `${n.id}:${n.x},${n.y}`)
      .join("|");
    return `${nodeCount}-${edgeCount}-${sample}`;
  }, [nodes, edges]);

  useEffect(() => {
    // When the graph changes, reset view so it starts centered
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [graphKey]);

  const visited = new Set(step?.visitedIds ?? []);
  const discovered = new Set((step as any)?.discoveredIds ?? []); // optional field
  const frontier = new Set(step?.frontierIds ?? []);
  const path = new Set(step?.pathToGoal ?? []);
  const exploredEdges = new Set(step?.exploredEdgeIds ?? []);
  const activeEdge = step?.activeEdgeId;

  const current = step?.currentNodeId;
  const neighbor = step?.neighborId;
  const goal = step?.goalId;

  // Compute bounds of content
  const bounds = useMemo(() => {
    const all = Object.values(nodes);
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    for (const n of all) {
      const x = n.x ?? 0;
      const y = n.y ?? 0;
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }

    if (!Number.isFinite(minX)) return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
    return { minX, maxX, minY, maxY };
  }, [graphKey]);


  // Padding + SVG size
  // Max visual extent of a node (radius + stroke). These are in SVG units.
  const maxNodeR = 26;
  const maxStroke = 4;
  const extraPad = 16;

// Total padding needed on each side
const pad = maxNodeR + maxStroke + extraPad;


  const width = Math.max(1, bounds.maxX - bounds.minX) + pad * 2;
  const height = Math.max(1, bounds.maxY - bounds.minY) + pad * 2;

  // Center point for scaling
  const cx = width / 2;
  const cy = height / 2;

  const clampZoom = (z: number) => Math.max(0.25, Math.min(2, z));

  const onWheel: React.WheelEventHandler<SVGSVGElement> = (e) => {
    e.preventDefault();

    // Wheel up => zoom in; wheel down => zoom out
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    const nextZoom = clampZoom(zoom * factor);

    // Zoom around mouse position by adjusting pan
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Find world point under mouse before zoom:
    const wx = (mx - cx - pan.x) / zoom + cx;
    const wy = (my - cy - pan.y) / zoom + cy;

    // Compute pan so that world point stays under mouse after zoom:
    const nextPanX = mx - cx - (wx - cx) * nextZoom;
    const nextPanY = my - cy - (wy - cy) * nextZoom;

    setZoom(nextZoom);
    useEffect(() => {
    setZoom(1);
    setPan({ x: nextPanX, y: nextPanY });
  }, [graph]);
  };

  const onMouseDown: React.MouseEventHandler<SVGSVGElement> = (e) => {
    isPanningRef.current = true;
    lastRef.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove: React.MouseEventHandler<SVGSVGElement> = (e) => {
    if (!isPanningRef.current || !lastRef.current) return;
    const dx = e.clientX - lastRef.current.x;
    const dy = e.clientY - lastRef.current.y;
    lastRef.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  };

  const endPan = () => {
    isPanningRef.current = false;
    lastRef.current = null;
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-2">
      {/* Zoom controls */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-400">Zoom</span>
        <input
          className="w-48"
          type="range"
          min={0.25}
          max={2}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
        />
        <div className="w-14 text-xs text-zinc-400">{Math.round(zoom * 100)}%</div>
        <button
          className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-1 text-xs hover:bg-zinc-900"
          onClick={resetView}
        >
          Reset
        </button>
      </div>

      <div className="overflow-auto">
        <svg
          key={graphKey}
          width={width}
          height={height}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={endPan}
          onMouseLeave={endPan}
          style={{
            cursor: isPanningRef.current ? "grabbing" : "grab",
            display: "block",
            width: `${width}px`,
            height: `${height}px`,
            minWidth: `${width}px`,
            minHeight: `${height}px`,
          }}
    >
    <g transform={`translate(${cx}, ${cy}) translate(${pan.x}, ${pan.y}) scale(${zoom}) translate(${-cx}, ${-cy})`}>
            {/* edges */}
            {edges.map((e, i) => {
              const a = nodes[e.from];
              const b = nodes[e.to];
              if (!a || !b) return null;

              const ax = (a.x ?? 0) - bounds.minX + pad;
              const ay = (a.y ?? 0) - bounds.minY + pad;
              const bx = (b.x ?? 0) - bounds.minX + pad;
              const by = (b.y ?? 0) - bounds.minY + pad;

              const id = edgeId(e.from, e.to, graph.directed);

              const isActive = activeEdge === id;
              const isExplored = exploredEdges.has(id);
              const isTreeEdge =
                step?.parent &&
                (step.parent[e.to] === e.from ||
                  (!graph.directed && step.parent[e.from] === e.to));

              const opacity = isActive ? 1 : isTreeEdge ? 0.8 : isExplored ? 0.45 : 0.18;
              const strokeWidth = isActive ? 4 : isTreeEdge ? 3 : 2;

              

              return (
                <line
                  key={`${e.from}-${e.to}-${i}`}
                  x1={ax}
                  y1={ay}
                  x2={bx}
                  y2={by}
                  stroke="currentColor"
                  opacity={opacity}
                  strokeWidth={strokeWidth}
                />
              );
            })}

            {/* nodes */}
            {Object.values(nodes).map((n) => {
              const x = (n.x ?? 0) - bounds.minX + pad;
              const y = (n.y ?? 0) - bounds.minY + pad;

              const isCurrent = current === n.id;
              const isNeighbor = neighbor === n.id;
              const isGoal = goal === n.id;
              const isFrontier = frontier.has(n.id);
              const isVisited = visited.has(n.id);
              const isDiscovered = discovered.has(n.id);
              const isPath = path.has(n.id);

              const strong = isCurrent || isGoal || isPath || isFrontier || isNeighbor;
              const opacity = strong ? 1 : isVisited ? 0.35 : isDiscovered ? 0.55 : 0.22;

              const r =
                isCurrent ? 26 :
                isGoal ? 24 :
                isNeighbor ? 24 :
                isFrontier ? 23 :
                21;

              const strokeWidth =
                isCurrent ? 4 :
                isGoal ? 4 :
                isFrontier ? 3 :
                2;

              return (
                <g key={n.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    opacity={opacity}
                  />
                  <text
                    x={x}
                    y={y + 5}
                    textAnchor="middle"
                    fontSize={14}
                    fill="currentColor"
                    opacity={opacity}
                  >
                    {n.id}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {step?.message ? (
          <div className="mt-2 text-xs text-zinc-400">{step.message}</div>
        ) : null}
      </div>
    </div>
  );
}
