import type { TreeSortMeta } from "../algorithms/trees/treeSort.ts"; 

export function TreeView(props: { meta?: TreeSortMeta }) {
  const meta = props.meta;
  

  if (!meta?.tree.rootId) {
    return <div className="text-sm text-zinc-400">Tree is empty.</div>;
  }

  const { nodes } = meta.tree;
  const highlight = new Set(meta.highlightNodeIds ?? []);
  const current = meta.currentNodeId;


  // Build edges
  const edges: { from: string; to: string }[] = [];
  for (const id of Object.keys(nodes)) {
    const n = nodes[id];
    if (n.left) edges.push({ from: id, to: n.left });
    if (n.right) edges.push({ from: id, to: n.right });
  }

  const all = Object.values(nodes);
  const maxX = Math.max(...all.map((n) => n.x ?? 0), 1);
  const maxY = Math.max(...all.map((n) => n.y ?? 0), 1);

  return (
    <div className="overflow-auto">
      <svg width={maxX + 140} height={maxY + 140}>
        {/* edges */}
        {edges.map((e) => {
          const a = nodes[e.from];
          const b = nodes[e.to];
          const ax = (a.x ?? 0) + 50;
          const ay = (a.y ?? 0) + 50;
          const bx = (b.x ?? 0) + 50;
          const by = (b.y ?? 0) + 50;

          return (
            <line
              key={`${e.from}-${e.to}`}
              x1={ax}
              y1={ay}
              x2={bx}
              y2={by}
              stroke="currentColor"
              opacity={0.35}
              strokeWidth={2}
            />
          );
        })}

        {/* nodes */}
        {Object.values(nodes).map((n) => {
          const x = (n.x ?? 0) + 50;
          const y = (n.y ?? 0) + 50;

          const isPath = highlight.has(n.id);
          const isCurrent = current === n.id;

          return (
            <g key={n.id}>
              <circle
                cx={x}
                cy={y}
                r={isCurrent ? 26 : 22}
                stroke="currentColor"
                strokeWidth={isCurrent ? 4 : 2}
                fill="transparent"
                opacity={isPath ? 1 : 0.35}
              />
              <text x={x} y={y + 5} textAnchor="middle" fontSize={14} fill="currentColor">
                {n.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
