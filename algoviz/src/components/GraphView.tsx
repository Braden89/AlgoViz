import React from "react";
import type { Graph, SearchStep, EdgeId } from "../algorithms/search/searchtypes"; // adjust path

function edgeId(from: string, to: string, directed: boolean): EdgeId {
  if (directed) return `${from}->${to}`;
  return from < to ? `${from}--${to}` : `${to}--${from}`;
}

export function GraphView(props: { graph?: Graph; step?: SearchStep }) {
  const { graph, step } = props;

  if (!graph || Object.keys(graph.nodes).length === 0) {
    return <div className="text-sm text-zinc-400">Graph is empty.</div>;
  }

  const nodes = graph.nodes;
  const edges = graph.edges;

  // Sets for quick membership tests
  const visited = new Set(step?.visitedIds ?? []);
  const discovered = new Set(step?.discoveredIds ?? []); // if you add it (recommended)
  const frontier = new Set(step?.frontierIds ?? []);
  const path = new Set(step?.pathToGoal ?? []);
  const exploredEdges = new Set(step?.exploredEdgeIds ?? []);
  const activeEdge = step?.activeEdgeId;

  const current = step?.currentNodeId;
  const neighbor = step?.neighborId;
  const goal = step?.goalId;

  // Compute bounds (so svg size fits)
  const all = Object.values(nodes);
  const maxX = Math.max(...all.map((n) => n.x ?? 0), 1);
  const maxY = Math.max(...all.map((n) => n.y ?? 0), 1);

  // Padding + node radius budget
  const pad = 60;
  const width = maxX + pad * 2;
  const height = maxY + pad * 2;

  return (
    <div className="overflow-auto">
      <svg width={width} height={height}>
        {/* edges */}
        {edges.map((e, i) => {
          const a = nodes[e.from];
          const b = nodes[e.to];
          if (!a || !b) return null;

          const ax = (a.x ?? 0) + pad;
          const ay = (a.y ?? 0) + pad;
          const bx = (b.x ?? 0) + pad;
          const by = (b.y ?? 0) + pad;

          const id = edgeId(e.from, e.to, graph.directed);

          const isActive = activeEdge === id;
          const isExplored = exploredEdges.has(id);
          const isTreeEdge =
            step?.parent &&
            (step.parent[e.to] === e.from || (!graph.directed && step.parent[e.from] === e.to));

          // Style rules (keep simple like TreeView)
          const opacity = isActive ? 1 : isTreeEdge ? 0.8 : isExplored ? 0.55 : 0.25;
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
          const x = (n.x ?? 0) + pad;
          const y = (n.y ?? 0) + pad;

          const isCurrent = current === n.id;
          const isNeighbor = neighbor === n.id;

          const isGoal = goal === n.id;
          const isFrontier = frontier.has(n.id);
          const isVisited = visited.has(n.id);
          const isDiscovered = discovered.has(n.id);
          const isPath = path.has(n.id);

          // Decide emphasis (opacity) similar to TreeView
          // Priority: current/path/goal/frontier/discovered/visited/none
          const strong = isCurrent || isGoal || isPath || isFrontier || isNeighbor;
          const opacity = strong ? 1 : isVisited ? 0.35 : isDiscovered ? 0.55 : 0.25;

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
      </svg>

      {/* Optional small legend/message */}
      {step?.message ? (
        <div className="mt-2 text-xs text-zinc-400">{step.message}</div>
      ) : null}
    </div>
  );
}
