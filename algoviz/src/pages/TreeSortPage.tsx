import { useMemo, useState } from "react";
import { TreeSort } from "../algorithms/trees/treeSort";
import { AlgorithmLayout } from "../components/AlgorithmLayout";
import { ArrayBars } from "../components/ArrayBars";
import { PseudocodePanel } from "../components/PseudocodePanel";
import { PlayerControls } from "../components/PlayerControls";
import { usePlayerStore } from "../state/playerStore";
import { MetricsPanel } from "../components/MetricPanel";
import { TreeView } from "../components/TreeView";

function makeRandomArray(n: number) {
  const len = Number.isFinite(n) ? Math.floor(n) : 20;
  const clamped = Math.max(5, Math.min(len, 60)); // trees get wide fast

  const arr: number[] = [];
  for (let i = 0; i < clamped; i++) arr.push(5 + Math.floor(Math.random() * 95));
  return arr;
}

export default function TreeSortPage() {
  const setSteps = usePlayerStore((s) => s.setSteps);
  const steps = usePlayerStore((s) => s.steps);
  const index = usePlayerStore((s) => s.index);
  const step = steps[index];

  const [size, setSize] = useState(18);
  const [seedArray, setSeedArray] = useState<number[]>(() => makeRandomArray(18));

  const canGenerate = Number.isFinite(size) && size >= 5 && size <= 60;
  const currentArray = useMemo(() => seedArray, [seedArray]);
  const loadSteps = () => setSteps(TreeSort.generateSteps(seedArray));

  return (
    <AlgorithmLayout
      title="Tree Sort (BST)"
      /* TOP: Full-width tree */
      bottom={
        <div className="space-y-4">
          <div className="text-sm text-zinc-300">Binary Search Tree</div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-2">
            <TreeView meta={step?.meta} />
          </div>

          {/* Controls live under the tree */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs text-zinc-400">Array size</label>
              <input
                className="w-28 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm"
                type="number"
                value={size}
                min={5}
                max={60}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (!Number.isFinite(v)) return;
                  setSize(v);
                }}
              />

              <button
                className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-900 disabled:opacity-50"
                onClick={() => {
                  setSeedArray(makeRandomArray(size));
                  setSteps([]);
                }}
                disabled={!canGenerate}
              >
                New Random Array
              </button>
            </div>

            <PlayerControls onPlay={loadSteps} />
          </div>
        </div>
      }

      /* MIDDLE LEFT: pseudocode */
      left={
        <PseudocodePanel
          pseudocode={TreeSort.pseudocode}
          activeLine={step?.line ?? 0}
        />
      }

      /* MIDDLE RIGHT: metrics + array */
      right={
        <div className="space-y-4">
          <MetricsPanel metrics={step?.metrics} />

          <div className="text-xs text-zinc-400">
            {step?.note ?? "Generate steps to begin."}
          </div>

          <ArrayBars
            step={
              step ?? {
                array: currentArray,
                line: 0,
                metrics: { comparisons: 0, swaps: 0 },
              }
            }
          />
        </div>
      }
    />
  );
}
