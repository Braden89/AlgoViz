import type { Graph } from "./searchtypes";

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Binary tree generator (undirected by default).
 * count: total nodes (>= 1)
 */
export function makeBinaryTreeGraph(opts: {
  count: number;
  directed?: boolean;
  levelGap?: number; // vertical spacing
  nodeGap?: number;  // base horizontal spacing
}): Graph {
  const count = clamp(Math.floor(opts.count), 1, 127);
  const directed = opts.directed ?? false;
  const levelGap = opts.levelGap ?? 90;
  const nodeGap = opts.nodeGap ?? 70;

  // Determine height such that we can fit `count` nodes in level order.
  // Level i has up to 2^i nodes.
  let remaining = count;
  let height = 0;
  while (remaining > 0) {
    remaining -= 1 << height;
    height++;
  }

  const nodes: Graph["nodes"] = {};
  const edges: Graph["edges"] = [];

  // Precompute how many nodes per level given total count.
  const nodesPerLevel: number[] = [];
  let used = 0;
  for (let lvl = 0; lvl < height; lvl++) {
    const cap = 1 << lvl;
    const take = Math.min(cap, count - used);
    nodesPerLevel.push(take);
    used += take;
    if (used >= count) break;
  }

  // Create positions:
  // Each level spreads nodes evenly across a width that grows with depth.
  // Root centered; deeper levels wider.
  const totalWidth = (1 << (nodesPerLevel.length - 1)) * nodeGap;

  let idx = 0;
  for (let lvl = 0; lvl < nodesPerLevel.length; lvl++) {
    const k = nodesPerLevel[lvl];
    const y = lvl * levelGap;

    // Spread k nodes across the totalWidth with padding
    const span = totalWidth;
    for (let j = 0; j < k; j++) {
      const x =
        k === 1
          ? span / 2
          : (span * j) / (k - 1);

      const id = `N${idx}`;
      nodes[id] = { id, x, y };
      idx++;
    }
  }

  // Edges: connect in heap-index style: parent i -> children 2i+1, 2i+2
  for (let i = 0; i < count; i++) {
    const from = `N${i}`;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < count) edges.push({ from, to: `N${left}` });
    if (right < count) edges.push({ from, to: `N${right}` });
  }

  return { nodes, edges, directed };
}

/**
 * Random “map” generator:
 * - places nodes randomly
 * - guarantees connectivity by building a random spanning tree
 * - adds extra edges based on density (0..1)
 */
export function makeRandomMapGraph(opts: {
  count: number;
  density: number; // 0..1 (extra edges)
  directed?: boolean;
  width?: number;
  height?: number;
  margin?: number;
}): Graph {
  const count = clamp(Math.floor(opts.count), 2, 80);
  const density = clamp(opts.density, 0, 1);
  const directed = opts.directed ?? false;

  const width = opts.width ?? 520;
  const height = opts.height ?? 320;
  const margin = opts.margin ?? 30;

  const nodes: Graph["nodes"] = {};
  const edges: Graph["edges"] = [];

  // Nodes
  for (let i = 0; i < count; i++) {
    const id = `N${i}`;
    nodes[id] = {
      id,
      x: rand(margin, width - margin),
      y: rand(margin, height - margin),
    };
  }

  // Helper to avoid duplicate undirected edges
  const edgeKey = (a: string, b: string) => {
    if (directed) return `${a}->${b}`;
    return a < b ? `${a}--${b}` : `${b}--${a}`;
  };
  const seen = new Set<string>();
  const addEdge = (a: string, b: string) => {
    if (a === b) return false;
    const k = edgeKey(a, b);
    if (seen.has(k)) return false;
    seen.add(k);
    edges.push({ from: a, to: b });
    return true;
  };

  // 1) Guarantee connectivity with a random spanning tree
  const remaining: string[] = Object.keys(nodes);
  const connected: string[] = [];

  connected.push(remaining.pop()!);
  while (remaining.length > 0) {
    const a = connected[Math.floor(Math.random() * connected.length)];
    const b = remaining.pop()!;
    addEdge(a, b);
    connected.push(b);
  }

  // 2) Add extra edges based on density
  // Max possible undirected edges is n(n-1)/2; we already have (n-1).
  const maxUndirected = (count * (count - 1)) / 2;
  const targetTotal = Math.floor((count - 1) + density * (maxUndirected - (count - 1)));

  let guard = 0;
  while (edges.length < targetTotal && guard < 20000) {
    guard++;
    const i = Math.floor(Math.random() * count);
    const j = Math.floor(Math.random() * count);
    addEdge(`N${i}`, `N${j}`);
  }

  return { nodes, edges, directed };
}
