import type { Step, StepInspectorItem } from "../types";
import type { Graph, SearchStep, EdgeId } from "./searchtypes";

function edgeId(from: string, to: string, directed: boolean): EdgeId {
  if (directed) return `${from}->${to}`;
  return from < to ? `${from}--${to}` : `${to}--${from}`;
}

function buildAdj(graph: Graph): Record<string, string[]> {
  const adj: Record<string, string[]> = {};
  for (const id of Object.keys(graph.nodes)) adj[id] = [];

  for (const e of graph.edges) {
    adj[e.from].push(e.to);
    if (!graph.directed) adj[e.to].push(e.from);
  }

  for (const id of Object.keys(adj)) adj[id].sort();
  return adj;
}

export const DFS = {
  id: "dfs",
  name: "Depth-First Search",
  category: "graphs" as const,

  pseudocode: [
    "DFS(graph, start):",
    "  stack ← [start]",
    "  discovered ← {start}",
    "  parent[start] ← null",
    "  while stack not empty:",
    "    u ← pop(stack)",
    "    if u already visited: continue",
    "    mark u visited",
    "    for each neighbor v of u:",
    "      if v not discovered:",
    "        parent[v] ← u",
    "        push v onto stack",
  ],

  generateSteps(graph: Graph, startId: string, goalId?: string): Step<SearchStep>[] {
    const adj = buildAdj(graph);

    const visited = new Set<string>();
    const discovered = new Set<string>();
    const exploredEdges = new Set<EdgeId>();
    const depthOrLevel: Record<string, number> = {};
    const metrics = { comparisons: 0, swaps: 0 };

    const parent: Record<string, string | null> = {};
    for (const id of Object.keys(graph.nodes)) parent[id] = null;

    const stack: string[] = [];
    const steps: Step<SearchStep>[] = [];

    const inspectorFor = (meta: SearchStep): StepInspectorItem[] => [
      { label: "Frontier", value: meta.frontierType, tone: "accent" },
      { label: "Phase", value: meta.phase, tone: "accent" },
      { label: "Current Node", value: meta.currentNodeId ?? null, tone: "warning" },
      { label: "Neighbor", value: meta.neighborId ?? null, tone: "warning" },
      { label: "Frontier Size", value: meta.frontierIds.length, tone: "success" },
      { label: "Visited", value: meta.visitedIds.length, tone: "success" },
      { label: "Discovered", value: meta.discoveredIds.length, tone: "success" },
      { label: "Goal", value: meta.goalId ?? null, tone: meta.foundGoal ? "success" : "danger" },
    ];

    const push = (meta: SearchStep) => {
      steps.push({
        array: [],
        line: meta.activeLine ?? 0,
        metrics: { ...metrics },
        note: meta.message,
        meta,
        inspector: inspectorFor(meta),
      });
    };

    discovered.add(startId);
    depthOrLevel[startId] = 0;
    stack.push(startId);

    push({
      algorithm: "dfs",
      frontierType: "stack",
      phase: "init",
      message: `Initialize stack with ${startId}`,
      currentNodeId: startId,
      goalId,
      discoveredIds: [...discovered],
      visitedIds: [...visited],
      frontierIds: [...stack],
      parent: { ...parent },
      depthOrLevel: { ...depthOrLevel },
      exploredEdgeIds: [],
      activeLine: 1,
    });

    while (stack.length > 0) {
      const node = stack.pop()!;

      push({
        algorithm: "dfs",
        frontierType: "stack",
        phase: "select",
        message: `Pop ${node}`,
        currentNodeId: node,
        goalId,
        discoveredIds: [...discovered],
        visitedIds: [...visited],
        frontierIds: [...stack],
        parent: { ...parent },
        depthOrLevel: { ...depthOrLevel },
        exploredEdgeIds: [...exploredEdges],
        activeLine: 5,
      });

      if (visited.has(node)) continue;

      visited.add(node);

      push({
        algorithm: "dfs",
        frontierType: "stack",
        phase: "visit",
        message: `Visit ${node}`,
        currentNodeId: node,
        goalId,
        discoveredIds: [...discovered],
        visitedIds: [...visited],
        frontierIds: [...stack],
        parent: { ...parent },
        depthOrLevel: { ...depthOrLevel },
        exploredEdgeIds: [...exploredEdges],
        foundGoal: goalId ? node === goalId : false,
        activeLine: 7,
      });

      if (goalId && node === goalId) {
        const path: string[] = [];
        let cur: string | null = node;
        while (cur) {
          path.push(cur);
          cur = parent[cur];
        }
        path.reverse();

        push({
          algorithm: "dfs",
          frontierType: "stack",
          phase: "done",
          message: `Goal found: ${goalId}`,
          currentNodeId: node,
          goalId,
          discoveredIds: [...discovered],
          visitedIds: [...visited],
          frontierIds: [...stack],
          parent: { ...parent },
          depthOrLevel: { ...depthOrLevel },
          exploredEdgeIds: [...exploredEdges],
          foundGoal: true,
          pathToGoal: path,
          activeLine: 0,
        });

        return steps;
      }

      const neighbors = adj[node] ?? [];
      for (const nb of [...neighbors].reverse()) {
        const e = edgeId(node, nb, graph.directed);
        exploredEdges.add(e);
        metrics.comparisons += 1;

        push({
          algorithm: "dfs",
          frontierType: "stack",
          phase: "explore-edge",
          message: `Explore ${node} → ${nb}`,
          currentNodeId: node,
          neighborId: nb,
          activeEdgeId: e,
          goalId,
          discoveredIds: [...discovered],
          visitedIds: [...visited],
          frontierIds: [...stack],
          parent: { ...parent },
          depthOrLevel: { ...depthOrLevel },
          exploredEdgeIds: [...exploredEdges],
          activeLine: 8,
        });

        if (!discovered.has(nb) && !visited.has(nb)) {
          parent[nb] = node;
          discovered.add(nb);
          depthOrLevel[nb] = (depthOrLevel[node] ?? 0) + 1;
          stack.push(nb);

          push({
            algorithm: "dfs",
            frontierType: "stack",
            phase: "enqueue",
            message: `Push ${nb}`,
            currentNodeId: nb,
            goalId,
            discoveredIds: [...discovered],
            visitedIds: [...visited],
            frontierIds: [...stack],
            parent: { ...parent },
            depthOrLevel: { ...depthOrLevel },
            exploredEdgeIds: [...exploredEdges],
            activeLine: 10,
          });
        }
      }
    }

    push({
      algorithm: "dfs",
      frontierType: "stack",
      phase: "done",
      message: goalId ? "Finished (goal not found)" : "Finished",
      goalId,
      discoveredIds: [...discovered],
      visitedIds: [...visited],
      frontierIds: [],
      parent: { ...parent },
      depthOrLevel: { ...depthOrLevel },
      exploredEdgeIds: [...exploredEdges],
      foundGoal: false,
      activeLine: 0,
    });

    return steps;
  },
};
