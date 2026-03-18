// src/pages/DfsPage.tsx
import { useState } from "react";
import { AlgorithmLayout } from "../components/AlgorithmLayout";
import { PseudocodePanel } from "../components/PseudocodePanel";
import { PlayerControls } from "../components/PlayerControls";
import { SearchMetricsPanel } from "../components/SearchMetricsPanel";
import { StepInspector } from "../components/StepInspector";
import { usePlayerStore } from "../state/playerStore";

import { GraphView } from "../components/GraphView";
import type { Graph, SearchStep } from "../algorithms/search/searchtypes";
import type { Step } from "../algorithms/types";

import { DFS } from "../algorithms/search/dfs";
import { makeBinaryTreeGraph, makeRandomMapGraph } from "../algorithms/search/graphGenerators";

export default function DfsPage() {
  const setSteps = usePlayerStore((s) => s.setSteps);
  const steps = usePlayerStore((s) => s.steps);
  const index = usePlayerStore((s) => s.index);

  const step = steps[index] as Step<SearchStep> | undefined;

  // ---- Graph Builder State ----
  const [graphType, setGraphType] = useState<"tree" | "map">("tree");
  const [nodeCount, setNodeCount] = useState<number>(15); // used by both
  const [density, setDensity] = useState<number>(0.25);   // map only

  const [graph, setGraph] = useState<Graph>(() =>
    makeBinaryTreeGraph({ count: 15 })
  );

  // Start/goal should match generated node ids (N0, N1, ...)
  const [start, setStart] = useState("N0");
  const [goal, setGoal] = useState(""); // optional

  const startValid = start in graph.nodes;
  const goalValid = goal === "" || goal in graph.nodes;
  const loadSteps = () => setSteps(DFS.generateSteps(graph, start, goal || undefined));

  function regenerateGraph() {
    const count =
      graphType === "tree"
        ? Math.max(1, Math.min(127, Math.floor(nodeCount)))
        : Math.max(2, Math.min(80, Math.floor(nodeCount)));

    const g =
      graphType === "tree"
        ? makeBinaryTreeGraph({ count })
        : makeRandomMapGraph({ count, density });

    setGraph(g);

    // Reset traversal state when graph changes
    setSteps([]);

    // Reset start/goal to valid defaults
    setStart("N0");
    setGoal("");
  }

  return (
    <AlgorithmLayout
      title="Depth-First Search (DFS)"
      bottom={
        <div className="space-y-4">
          <div className="text-sm text-zinc-300">Graph</div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-2">
            <GraphView graph={graph} step={step?.meta} />
          </div>

          <div className="space-y-3">
            {/* Graph builder controls */}
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs text-zinc-400">Graph Type</label>
              <select
                className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm"
                value={graphType}
                onChange={(e) => setGraphType(e.target.value as "tree" | "map")}
              >
                <option value="tree">Binary Tree</option>
                <option value="map">Random Map</option>
              </select>

              <label className="text-xs text-zinc-400">Nodes</label>
              <input
                className="w-24 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm"
                type="number"
                min={graphType === "tree" ? 1 : 2}
                max={graphType === "tree" ? 127 : 80}
                value={nodeCount}
                onChange={(e) => setNodeCount(Number(e.target.value))}
              />

              {graphType === "map" && (
                <>
                  <label className="text-xs text-zinc-400">Density</label>
                  <input
                    className="w-32"
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={density}
                    onChange={(e) => setDensity(Number(e.target.value))}
                  />
                  <div className="w-12 text-xs text-zinc-400">
                    {density.toFixed(2)}
                  </div>
                </>
              )}

              <button
                className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-900"
                onClick={regenerateGraph}
              >
                Generate Graph
              </button>
            </div>

            {/* DFS run controls */}
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs text-zinc-400">Start</label>
              <input
                className={[
                  "w-24 rounded-lg border bg-zinc-950/40 px-3 py-2 text-sm",
                  startValid ? "border-zinc-800" : "border-red-700",
                ].join(" ")}
                value={start}
                onChange={(e) => {
                  setStart(e.target.value.trim());
                  setSteps([]);
                }}
                placeholder="N0"
              />

              <label className="text-xs text-zinc-400">Goal (optional)</label>
              <input
                className={[
                  "w-24 rounded-lg border bg-zinc-950/40 px-3 py-2 text-sm",
                  goalValid ? "border-zinc-800" : "border-red-700",
                ].join(" ")}
                value={goal}
                onChange={(e) => {
                  setGoal(e.target.value.trim());
                  setSteps([]);
                }}
                placeholder="(none)"
              />
            </div>

            <PlayerControls onPlay={startValid && goalValid ? loadSteps : undefined} />
          </div>
        </div>
      }
      left={<PseudocodePanel pseudocode={DFS.pseudocode} activeLine={step?.line ?? 0} />}
      right={
        <div className="space-y-4">
          <SearchMetricsPanel metrics={step?.metrics} step={step?.meta} />
          <StepInspector items={step?.inspector} />
          <div className="text-xs text-zinc-400">
            {step?.note ?? "Generate a graph, then run DFS from a start node."}
          </div>

          <div className="text-xs text-zinc-500">
            Tip: For the tree graph, try <code>N0</code> as the start.
          </div>
        </div>
      }
    />
  );
}
