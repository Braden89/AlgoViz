import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Graph, SearchStep, EdgeId } from "../algorithms/search/searchtypes";

function edgeId(from: string, to: string, directed: boolean): EdgeId {
  if (directed) return `${from}->${to}`;
  return from < to ? `${from}--${to}` : `${to}--${from}`;
}

export function GraphView(props: { graph?: Graph; step?: SearchStep }) {
  const { graph, step } = props;

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
    const nodeCount = Object.keys(nodes).length;
    const edgeCount = edges.length;
    const sample = Object.values(nodes)
      .slice(0, 3)
      .map((n) => `${n.id}:${n.x},${n.y}`)
      .join("|");
    return `${nodeCount}-${edgeCount}-${sample}`;
  }, [nodes, edges]);

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [graphKey]);

  const visited = new Set(step?.visitedIds ?? []);
  const discovered = new Set(step?.discoveredIds ?? []);
  const frontier = new Set(step?.frontierIds ?? []);
  const path = new Set(step?.pathToGoal ?? []);
  const exploredEdges = new Set(step?.exploredEdgeIds ?? []);
  const activeEdge = step?.activeEdgeId;

  const pathNodes = step?.pathToGoal ?? [];

  const pathEdgeSet = useMemo(() => {
    const s = new Set<EdgeId>();
    for (let i = 0; i < pathNodes.length - 1; i++) {
      s.add(edgeId(pathNodes[i], pathNodes[i + 1], graph.directed));
    }
    return s;
  }, [pathNodes, graph.directed]);

  const treeEdgeSet = useMemo(() => {
    const s = new Set<EdgeId>();
    const p = step?.parent ?? {};
    for (const child of Object.keys(p)) {
      const par = p[child];
      if (!par) continue;
      s.add(edgeId(par, child, graph.directed));
    }
    return s;
  }, [step?.parent, graph.directed]);

  const current = step?.currentNodeId;
  const neighbor = step?.neighborId;
  const goal = step?.goalId;

  const bounds = useMemo(() => {
    const all = Object.values(nodes);
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

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
  }, [nodes]);

  const maxNodeR = 26;
  const maxStroke = 4;
  const extraPad = 16;
  const pad = maxNodeR + maxStroke + extraPad;
  const viewportPad = pad * 2;
  const panSlackX = pad * 4;
  const panSlackY = pad;
  const initialOffsetX = pad;
  const initialOffsetY = pad * 2;

  const width = Math.max(1, bounds.maxX - bounds.minX) + pad * 2;
  const height = Math.max(1, bounds.maxY - bounds.minY) + pad * 2;

  const scaledWidth = width * zoom;
  const scaledHeight = height * zoom;

  const canvasWidth = Math.ceil(Math.max(width, scaledWidth) + viewportPad * 2 + panSlackX * 2);
  const canvasHeight = Math.ceil(Math.max(height, scaledHeight) + viewportPad * 2 + panSlackY * 2);

  const clampZoom = (z: number) => Math.max(0.25, Math.min(2, z));

  const onWheel: React.WheelEventHandler<SVGSVGElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    const nextZoom = clampZoom(zoom * factor);

    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const wx = (mx - viewportPad - initialOffsetX - pan.x) / zoom;
    const wy = (my - viewportPad - initialOffsetY + pan.y) / zoom;

    const nextPanX = mx - viewportPad - initialOffsetX - wx * nextZoom;
    const nextPanY = my - viewportPad - initialOffsetY - wy * nextZoom;

    setZoom(nextZoom);
    setPan({ x: nextPanX, y: nextPanY });
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

      <div
        className="h-[420px] overflow-auto overscroll-contain rounded-xl"
        style={{ overscrollBehavior: "contain" }}
      >
        <svg
          key={graphKey}
          width={canvasWidth}
          height={canvasHeight}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={endPan}
          onMouseLeave={endPan}
          style={{
            cursor: isPanningRef.current ? "grabbing" : "grab",
            display: "block",
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            minWidth: `${canvasWidth}px`,
            minHeight: `${canvasHeight}px`,
          }}
        >
          <g transform={`translate(${viewportPad + initialOffsetX + pan.x}, ${viewportPad + initialOffsetY + pan.y}) scale(${zoom})`}>
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
              const isTreeEdge = treeEdgeSet.has(id);
              const isPathEdge = pathEdgeSet.has(id);

              const prunedEdges = new Set(step?.prunedEdgeIds ?? []);
              const isPruned =
                prunedEdges.has(id) ||
                Boolean(step?.foundGoal && isTreeEdge && !isPathEdge);

              const stroke = isPathEdge
                ? "rgb(34 197 94)"
                : isPruned
                  ? "rgb(239 68 68)"
                  : "currentColor";

              const opacity = isActive
                ? 1
                : isPathEdge
                  ? 0.95
                  : isPruned
                    ? 0.75
                    : isTreeEdge
                      ? 0.55
                      : isExplored
                        ? 0.3
                        : 0.14;

              const strokeWidth = isActive ? 4 : isPathEdge ? 4 : isPruned ? 3 : isTreeEdge ? 2.5 : 2;

              return (
                <line
                  key={`${e.from}-${e.to}-${i}`}
                  x1={ax}
                  y1={ay}
                  x2={bx}
                  y2={by}
                  stroke={stroke}
                  opacity={opacity}
                  strokeWidth={strokeWidth}
                />
              );
            })}

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
              const isPrunedNode = step?.foundGoal && visited.has(n.id) && !isPath;

              const strong = isCurrent || isGoal || isPath || isFrontier || isNeighbor;
              const opacity = strong ? 1 : isVisited ? 0.35 : isDiscovered ? 0.55 : 0.22;

              const r = isCurrent ? 26 : isGoal ? 24 : isNeighbor ? 24 : isFrontier ? 23 : 21;
              const strokeWidth = isCurrent ? 4 : isGoal ? 4 : isFrontier ? 3 : 2;

              const stroke = isPath
                ? "rgb(34 197 94)"
                : isPrunedNode
                  ? "rgb(239 68 68)"
                  : "currentColor";

              return (
                <g key={n.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    stroke={stroke}
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
