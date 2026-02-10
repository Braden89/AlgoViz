export type GraphNode = {
  id: string;
  x: number;
  y: number;
};

export type GraphEdge = {
  from: string;
  to: string;
  weight?: number; // optional now; future-proof for Dijkstra/A*
};

export type Graph = {
  nodes: Record<string, GraphNode>;
  edges: GraphEdge[];
  directed: boolean;
};

export type EdgeId = string;

export type SearchAlgorithm = "bfs" | "dfs";
export type FrontierType = "queue" | "stack";

export type SearchPhase =
  | "init"
  | "select"
  | "explore-edge"
  | "enqueue"
  | "dequeue"
  | "visit"
  | "done";

export type SearchStep = {
  algorithm: SearchAlgorithm;
  frontierType: FrontierType;

  // Playback / debugging
  phase: SearchPhase;
  message?: string;
  activeLine?: number;
  stepIndex?: number; // optional, but handy if you scrub

  // Node states
  currentNodeId?: string;
  neighborId?: string;

  // Two-stage state (recommended)
  discoveredIds: string[]; // seen / added to frontier
  visitedIds: string[];    // fully processed / expanded

  // Frontier snapshot
  frontierIds: string[];

  // Edge highlighting
  activeEdgeId?: EdgeId;
  exploredEdgeIds?: EdgeId[];

  // Parent tree (path reconstruction)
  parent: Record<string, string | null>;

  // Optional metrics for richer viz
  discoveredAt?: Record<string, number>; // BFS: discovery order or distance
  finishedAt?: Record<string, number>;   // DFS finish time
  depthOrLevel?: Record<string, number>; // BFS level or DFS depth

  // Optional “render helpers”
  treeEdgeIds?: EdgeId[];    // edges implied by parent[] so far
  activePathIds?: string[];  // reconstructed path from start->current or start->goal

  // Goal
  goalId?: string;
  foundGoal?: boolean;
  pathToGoal?: string[];
};
