import type { Graph } from "./searchtypes";

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function dist2(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}


/**
 * Binary tree generator (undirected by default).
 * count: total nodes (>= 1)
 */
export function makeBinaryTreeGraph(opts: {
  count: number;
  directed?: boolean;

  // layout tuning
  width?: number;    // preferred viewport width (can expand if needed)
  height?: number;   // preferred viewport height (can expand if needed)
  margin?: number;

  levelGap?: number; // base vertical spacing
  nodeGap?: number;  // base horizontal spacing (pre-fit)

  minNodeDist?: number; // NEW: minimum distance between node centers horizontally
}): Graph {
  const count = clamp(Math.floor(opts.count), 1, 127);
  const directed = opts.directed ?? false;

  // Preferred size (we may expand width to satisfy minNodeDist)
  let W = opts.width ?? 520;
  const H = opts.height ?? 320;
  const margin = opts.margin ?? 30;

  const levelGap = opts.levelGap ?? 90;
  const nodeGap = opts.nodeGap ?? 70;

  // This is the key: choose a min center-to-center spacing.
  // Your circles are ~22–26 radius when current, so 52–60 is safe.
  const minNodeDist = opts.minNodeDist ?? 56;

  const nodes: Graph["nodes"] = {};
  const edges: Graph["edges"] = [];

  // Build edges (heap-index style)
  for (let i = 0; i < count; i++) {
    const from = `N${i}`;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < count) edges.push({ from, to: `N${left}` });
    if (right < count) edges.push({ from, to: `N${right}` });
  }

  // --- In-order layout in "layout coordinates" ---
  let cursor = 0;
  const assign = (i: number, depth: number) => {
    if (i >= count) return;
    assign(2 * i + 1, depth + 1);

    const id = `N${i}`;
    nodes[id] = { id, x: cursor * nodeGap, y: depth * levelGap };
    cursor++;

    assign(2 * i + 2, depth + 1);
  };
  assign(0, 0);

  // Compute bounds
  const all = Object.values(nodes);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const n of all) {
    minX = Math.min(minX, n.x);
    maxX = Math.max(maxX, n.x);
    minY = Math.min(minY, n.y);
    maxY = Math.max(maxY, n.y);
  }

  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1, maxY - minY);

  const availWPreferred = Math.max(1, W - 2 * margin);
  const availH = Math.max(1, H - 2 * margin);

  // We want horizontal spacing between adjacent in-order positions (nodeGap * scale)
  // to be at least minNodeDist.
  const minScaleForSpacing = minNodeDist / nodeGap;

  // If the preferred width can't support this min scale, expand W until it can.
  // Required available width to keep spacing:
  // spanX * minScaleForSpacing <= availW
  const neededAvailW = spanX * minScaleForSpacing;
  if (neededAvailW > availWPreferred) {
    W = neededAvailW + 2 * margin; // expand layout width
  }

  const availW = Math.max(1, W - 2 * margin);

  const scaleX = availW / spanX;
  const scaleY = availH / spanY;

  // Important: DO NOT shrink below minScaleForSpacing, otherwise circles overlap.
  // If vertical becomes tight, we allow it to compress vertically a bit; overlap is mainly horizontal.
  const scale = Math.min(scaleX, scaleY, 1.0);
  const finalScale = Math.max(scale, minScaleForSpacing);

  // Apply transform
  for (const id of Object.keys(nodes)) {
    const n = nodes[id];
    n.x = (n.x - minX) * finalScale + margin;
    n.y = (n.y - minY) * finalScale + margin;
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
  density: number;
  directed?: boolean;
  width?: number;
  height?: number;
  margin?: number;
  minDist?: number;       // minimum spacing between nodes
  maxAttempts?: number;   // placement attempts per node

  maxEdgeLen?: number;    // NEW: cap extra-edge length (reduces crossings)
}): Graph {
  const count = clamp(Math.floor(opts.count), 2, 80);
  const density = clamp(opts.density, 0, 1);
  const directed = opts.directed ?? false;

  const width = opts.width ?? 520;
  const height = opts.height ?? 320;
  const margin = opts.margin ?? 30;

  const nodes: Graph["nodes"] = {};
  const edges: Graph["edges"] = [];

  // ---- Node placement with minimum spacing ----
  const minDist = opts.minDist ?? 50;
  const maxAttempts = opts.maxAttempts ?? 10000;
  const minDistSq = minDist * minDist;

  for (let i = 0; i < count; i++) {
    const id = `N${i}`;

    let placed = false;
    let attempts = 0;
    let localMinDistSq = minDistSq;

    while (!placed && attempts < maxAttempts) {
      attempts++;

      const x = rand(margin, width - margin);
      const y = rand(margin, height - margin);

      let ok = true;
      for (let j = 0; j < i; j++) {
        const other = nodes[`N${j}`];
        if (!other) continue;
        if (dist2(x, y, other.x, other.y) < localMinDistSq) {
          ok = false;
          break;
        }
      }

      if (ok) {
        nodes[id] = { id, x, y };
        placed = true;
        break;
      }

      if (attempts % 300 === 0) {
        localMinDistSq *= 0.92; // relax ~8%
      }
    }

    if (!placed) {
      nodes[id] = {
        id,
        x: rand(margin, width - margin),
        y: rand(margin, height - margin),
      };
    }
  }

  // ---- Edge helpers (dedupe, undirected normalization) ----
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

  // Cap edge length for "extra" edges (spanning tree edges can be long if needed for connectivity)
  const maxEdgeLen = opts.maxEdgeLen ?? 220;
  const maxEdgeLenSq = maxEdgeLen * maxEdgeLen;

  const isShortEnough = (a: string, b: string) => {
    const ax = nodes[a].x, ay = nodes[a].y;
    const bx = nodes[b].x, by = nodes[b].y;
    const dx = ax - bx, dy = ay - by;
    return dx * dx + dy * dy <= maxEdgeLenSq;
  };

  const addLocalEdge = (a: string, b: string) => {
    if (!isShortEnough(a, b)) return false;
    return addEdge(a, b);
  };

  // ---- 1) Guarantee connectivity: random spanning tree ----
  const remaining: string[] = Object.keys(nodes);
  const connected: string[] = [];

  connected.push(remaining.pop()!);
  while (remaining.length > 0) {
    const a = connected[Math.floor(Math.random() * connected.length)];
    const b = remaining.pop()!;
    // For connectivity we allow the edge even if it's long
    addEdge(a, b);
    connected.push(b);
  }

  // ---- 2) Add extra edges "map-style": k-nearest neighbors ----
  // density 0..1 -> k 1..5 (keep it modest to avoid clutter)
  const k = Math.max(1, Math.min(5, Math.floor(1 + density * 4)));

  const ids = Object.keys(nodes);
  for (const a of ids) {
    const ax = nodes[a].x;
    const ay = nodes[a].y;

    const nearest = ids
      .filter((b) => b !== a)
      .map((b) => {
        const bx = nodes[b].x;
        const by = nodes[b].y;
        const dx = ax - bx;
        const dy = ay - by;
        return { b, d2: dx * dx + dy * dy };
      })
      .sort((u, v) => u.d2 - v.d2)
      .slice(0, k);

    for (const n of nearest) addLocalEdge(a, n.b);
  }

  return { nodes, edges, directed };
}
