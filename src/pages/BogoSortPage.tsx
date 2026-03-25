import { useMemo, useState } from "react";
import { BogoSort } from "../algorithms/sorting/bogoSort";
import { AlgorithmLayout } from "../components/AlgorithmLayout";
import { ArrayBars } from "../components/ArrayBars";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { PseudocodePanel } from "../components/PseudocodePanel";
import { PlayerControls } from "../components/PlayerControls";
import { usePlayerStore } from "../state/playerStore";
import { MetricsPanel } from "../components/MetricPanel";

function makeRandomArray(n: number) {
  const len = Number.isFinite(n) ? Math.floor(n) : 6;
  const clamped = Math.max(3, Math.min(len, 9));

  const arr: number[] = [];
  for (let i = 0; i < clamped; i++) arr.push(1 + Math.floor(Math.random() * 30));
  return arr;
}

export default function BogoSortPage() {
  const setSteps = usePlayerStore((s) => s.setSteps);
  const steps = usePlayerStore((s) => s.steps);
  const index = usePlayerStore((s) => s.index);
  const step = steps[index];

  const [size, setSize] = useState(6);
  const [seedArray, setSeedArray] = useState<number[]>(() => makeRandomArray(6));

  const canGenerate = Number.isFinite(size) && size >= 3 && size <= 9;
  const currentArray = useMemo(() => seedArray, [seedArray]);
  const loadSteps = () => setSteps(BogoSort.generateSteps(seedArray));

  return (
    <AlgorithmLayout
      title="Bogo Sort"
      headerRight={
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
          <Breadcrumbs
            items={[
              { label: "Home", to: "/" },
              { label: "Sorting", to: "/algorithms/sorting" },
              { label: "Bogo Sort" },
            ]}
          />
        </div>
      }
      left={
        <ArrayBars
          step={
            step ?? {
              array: currentArray,
              line: 0,
              metrics: { comparisons: 0, swaps: 0 },
            }
          }
        />
      }
      right={
        <div className="space-y-4">
          <PseudocodePanel pseudocode={BogoSort.pseudocode} activeLine={step?.line ?? 0} />
          <MetricsPanel metrics={step?.metrics} />
          <div className="text-xs text-zinc-500">
            Educational only: this implementation caps attempts at 200.
          </div>
        </div>
      }
      bottom={
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-zinc-400">Array size</label>
            <input
              className="w-28 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm"
              type="number"
              value={size}
              min={3}
              max={9}
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
      }
    />
  );
}
