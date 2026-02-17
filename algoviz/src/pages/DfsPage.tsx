// src/pages/DfsPage.tsx
import { useMemo, useState } from "react";
import { AlgorithmLayout } from "../components/AlgorithmLayout";
import { PseudocodePanel } from "../components/PseudocodePanel";
import { PlayerControls } from "../components/PlayerControls";
import { MetricsPanel } from "../components/MetricPanel";
import { usePlayerStore } from "../state/playerStore";

import { GraphView } from "../components/GraphView";
import type { Graph, SearchStep } from "../algorithms/search/searchtypes";
import type { Step } from "../algorithms/types";

import { DFS } from "../algorithms/search/dfs";

// Simple demo graph (replace later with your graph editor / generator)
function demoGraph(): Graph {
  return {
    directed: false,
    nodes: {
      A: { id: "A", x: 60, y: 60 },
      B: { id: "B", x: 220, y: 40 },
      C: { id: "C", x: 360, y: 120 },
      D: { id: "D", x: 130, y: 200 },
      E: { id: "E", x: 280, y: 220 },
      F: { id: "F", x: 460, y: 240 },
    },
    edges: [
      { from: "A", to: "B" },
      { from: "A", to: "D" },
      { from: "B", to: "C" },
      { from: "B", to: "D" },
      { from: "C", to: "E" },
      { from: "D", to: "E" },
      { from: "E", to: "F" },
    ],
  };
}

export default function DfsPage() {
  const setSteps = usePlayerStore((s) => s.setSteps);
  const steps = usePlayerStore((s) => s.steps);
  const index = usePlayerStore((s) => s.index);

  // Your global store step is untyped; cast for convenience
  const step = steps[index] as Step<SearchStep> | undefined;

  const graph = useMemo(() => demoGraph(), []);

  const [start, setStart] = useState("A");
  const [goal, setGoal] = useState(""); // optional

  const startValid = start in graph.nodes;
  const goalValid = goal === "" || goal in graph.nodes;

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
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs text-zinc-400">Start</label>
              <input
                className={[
                  "w-20 rounded-lg border bg-zinc-950/40 px-3 py-2 text-sm",
                  startValid ? "border-zinc-800" : "border-red-700",
                ].join(" ")}
                value={start}
                onChange={(e) => setStart(e.target.value.trim().toUpperCase())}
                placeholder="A"
              />

              <label className="text-xs text-zinc-400">Goal (optional)</label>
              <input
                className={[
                  "w-20 rounded-lg border bg-zinc-950/40 px-3 py-2 text-sm",
                  goalValid ? "border-zinc-800" : "border-red-700",
                ].join(" ")}
                value={goal}
                onChange={(e) => setGoal(e.target.value.trim().toUpperCase())}
                placeholder="(none)"
              />

              <button
                className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-900 disabled:opacity-50"
                onClick={() => setSteps(DFS.generateSteps(graph, start, goal || undefined))}
                disabled={!startValid || !goalValid}
              >
                Generate Steps
              </button>
            </div>

            <PlayerControls />
          </div>
        </div>
      }
      left={
        <PseudocodePanel
          pseudocode={DFS.pseudocode}
          activeLine={step?.line ?? 0}
        />
      }
      right={
        <div className="space-y-4">
          <MetricsPanel metrics={step?.metrics} />
          <div className="text-xs text-zinc-400">
            {step?.note ?? "Pick a start node and generate steps to begin."}
          </div>
        </div>
      }
    />
  );
}
