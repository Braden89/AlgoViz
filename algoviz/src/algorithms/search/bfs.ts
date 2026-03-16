import type { Step } from "../types";
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

export const BFS = {
  id: "bfs",
  name: "Breadth-First Search",
  category: "graphs" as const,

  pseudocode: [
    "BFS(graph, start):",
    "  queue <- [start]",
    "  discovered <- {start}",
    "  parent[start] <- null",
    "  if start is goal: return [start]",
    "  while queue not empty:",
    "    u <- dequeue(queue)",
    "    mark u visited",
    "    for each neighbor v of u:",
    "      if v not discovered:",
    "        parent[v] <- u",
    "        if v is goal: return path(start..v)",
    "        enqueue v onto queue",
  ],

  generateSteps(graph: Graph, startId: string, goalId?: string): Step<SearchStep>[] {
    const adj = buildAdj(graph);

    const visited = new Set<string>();
    const discovered = new Set<string>();
    const exploredEdges = new Set<EdgeId>();

    const parent: Record<string, string | null> = {};
    for (const id of Object.keys(graph.nodes)) parent[id] = null;

    const queue: string[] = [];
    const steps: Step<SearchStep>[] = [];

    const push = (meta: SearchStep) => {
      steps.push({
        array: [],
        line: meta.activeLine ?? 0,
        metrics: { comparisons: 0, swaps: 0 },
        note: meta.message,
        meta,
      });
    };

    discovered.add(startId);
    queue.push(startId);

    push({
      algorithm: "bfs",
      frontierType: "queue",
      phase: "init",
      message: `Initialize queue with ${startId}`,
      currentNodeId: startId,
      goalId,
      discoveredIds: [...discovered],
      visitedIds: [...visited],
      frontierIds: [...queue],
      parent: { ...parent },
      exploredEdgeIds: [],
      activeLine: 1,
    });

    if (goalId && startId === goalId) {
      push({
        algorithm: "bfs",
        frontierType: "queue",
        phase: "done",
        message: `Start is goal: ${goalId}`,
        currentNodeId: startId,
        goalId,
        discoveredIds: [...discovered],
        visitedIds: [...visited],
        frontierIds: [...queue],
        parent: { ...parent },
        exploredEdgeIds: [],
        foundGoal: true,
        pathToGoal: [startId],
        activeLine: 4,
      });

      return steps;
    }

    while (queue.length > 0) {
      const node = queue.shift()!;

      push({
        algorithm: "bfs",
        frontierType: "queue",
        phase: "dequeue",
        message: `Dequeue ${node}`,
        currentNodeId: node,
        goalId,
        discoveredIds: [...discovered],
        visitedIds: [...visited],
        frontierIds: [...queue],
        parent: { ...parent },
        exploredEdgeIds: [...exploredEdges],
        activeLine: 6,
      });

      if (visited.has(node)) continue;
      visited.add(node);

      push({
        algorithm: "bfs",
        frontierType: "queue",
        phase: "visit",
        message: `Visit ${node}`,
        currentNodeId: node,
        goalId,
        discoveredIds: [...discovered],
        visitedIds: [...visited],
        frontierIds: [...queue],
        parent: { ...parent },
        exploredEdgeIds: [...exploredEdges],
        activeLine: 7,
      });

      const neighbors = adj[node] ?? [];
      for (const nb of neighbors) {
        const e = edgeId(node, nb, graph.directed);
        exploredEdges.add(e);

        push({
          algorithm: "bfs",
          frontierType: "queue",
          phase: "explore-edge",
          message: `Explore ${node} -> ${nb}`,
          currentNodeId: node,
          neighborId: nb,
          activeEdgeId: e,
          goalId,
          discoveredIds: [...discovered],
          visitedIds: [...visited],
          frontierIds: [...queue],
          parent: { ...parent },
          exploredEdgeIds: [...exploredEdges],
          activeLine: 8,
        });

        if (!discovered.has(nb) && !visited.has(nb)) {
          parent[nb] = node;
          discovered.add(nb);

          if (goalId && nb === goalId) {
            const path: string[] = [];
            let cur: string | null = nb;
            while (cur) {
              path.push(cur);
              cur = parent[cur];
            }
            path.reverse();

            push({
              algorithm: "bfs",
              frontierType: "queue",
              phase: "done",
              message: `Goal found: ${goalId}`,
              currentNodeId: nb,
              neighborId: nb,
              activeEdgeId: e,
              goalId,
              discoveredIds: [...discovered],
              visitedIds: [...visited],
              frontierIds: [...queue],
              parent: { ...parent },
              exploredEdgeIds: [...exploredEdges],
              foundGoal: true,
              pathToGoal: path,
              activeLine: 11,
            });

            return steps;
          }

          queue.push(nb);

          push({
            algorithm: "bfs",
            frontierType: "queue",
            phase: "enqueue",
            message: `Enqueue ${nb}`,
            currentNodeId: nb,
            goalId,
            discoveredIds: [...discovered],
            visitedIds: [...visited],
            frontierIds: [...queue],
            parent: { ...parent },
            exploredEdgeIds: [...exploredEdges],
            activeLine: 12,
          });
        }
      }
    }

    push({
      algorithm: "bfs",
      frontierType: "queue",
      phase: "done",
      message: goalId ? "Finished (goal not found)" : "Finished",
      goalId,
      discoveredIds: [...discovered],
      visitedIds: [...visited],
      frontierIds: [],
      parent: { ...parent },
      exploredEdgeIds: [...exploredEdges],
      foundGoal: false,
      activeLine: 0,
    });

    return steps;
  },
};
