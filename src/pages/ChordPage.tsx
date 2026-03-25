import { useState } from "react";
import { AlgorithmLayout } from "../components/AlgorithmLayout";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { PlayerControls } from "../components/PlayerControls";
import { PseudocodePanel } from "../components/PseudocodePanel";
import { StepInspector } from "../components/StepInspector";
import { Chord, type ChordConfig, type ChordMeta, type ChordScenarioId } from "../algorithms/networking/chord";
import { ChordMetricsPanel } from "../components/ChordMetricsPanel";
import { ChordView } from "../components/ChordView";
import { usePlayerStore } from "../state/playerStore";
import type { Step } from "../algorithms/types";

function parseNodeIds(input: string) {
  return input
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((value) => Number.isFinite(value));
}

export default function ChordPage() {
  const setSteps = usePlayerStore((store) => store.setSteps);
  const steps = usePlayerStore((store) => store.steps);
  const index = usePlayerStore((store) => store.index);

  const [scenarioId, setScenarioId] = useState<ChordScenarioId>("balanced");
  const [config, setConfig] = useState<ChordConfig>(() => Chord.createConfig("balanced"));
  const [nodeInput, setNodeInput] = useState(() => Chord.createConfig("balanced").nodeIds.join(", "));

  const scenario = Chord.scenarios[scenarioId];
  const step = steps[index] as Step<ChordMeta> | undefined;
  const visibleMeta = step?.meta ?? Chord.previewMeta(config);

  const resetSteps = () => setSteps([]);

  const updateConfig = (updater: (current: ChordConfig) => ChordConfig) => {
    setConfig((current) => updater(current));
    resetSteps();
  };

  const loadScenario = (nextScenarioId: ChordScenarioId) => {
    const nextConfig = Chord.createConfig(nextScenarioId);
    setScenarioId(nextScenarioId);
    setConfig(nextConfig);
    setNodeInput(nextConfig.nodeIds.join(", "));
    resetSteps();
  };

  const applyNodeInput = () => {
    const parsed = parseNodeIds(nodeInput);
    if (parsed.length === 0) return;
    updateConfig((current) => ({
      ...current,
      nodeIds: parsed,
      startNode: parsed.includes(current.startNode) ? current.startNode : parsed[0],
    }));
  };

  const loadSteps = () => {
    setSteps(Chord.generateSteps(config));
  };

  return (
    <AlgorithmLayout
      title="Chord Distributed Hash Table"
      headerRight={
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
          <Breadcrumbs
            items={[
              { label: "Home", to: "/" },
              { label: "Networking", to: "/algorithms/networking" },
              { label: "Chord" },
            ]}
          />
        </div>
      }
      left={<PseudocodePanel pseudocode={Chord.pseudocode} activeLine={step?.line ?? 0} />}
      right={
        <div className="space-y-4">
          <div>
            <div className="text-sm text-zinc-300">Overview</div>
            <div className="mt-2 text-sm text-zinc-400">
              Chord places nodes and keys on a circular identifier space, then uses finger tables to route lookups in logarithmic hops.
            </div>
          </div>

          <ChordMetricsPanel meta={visibleMeta} />
          <StepInspector items={step?.inspector} />

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-3 text-sm text-zinc-400">
            {step?.note ?? scenario.description}
          </div>

          <div className="text-xs text-zinc-500">
            Change the ring membership or lookup key to see how fingers shorten the path compared with walking successor by successor.
          </div>
        </div>
      }
      bottom={
        <div className="space-y-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/20 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <div className="text-sm text-zinc-300">Scenario</div>
                <div className="text-xs text-zinc-500">Load a preset ring, then customize the node set and lookup.</div>
              </div>

              <select
                className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm"
                value={scenarioId}
                onChange={(event) => loadScenario(event.target.value as ChordScenarioId)}
              >
                {Object.values(Chord.scenarios).map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </select>

              <button
                className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-900"
                onClick={() => loadScenario(scenarioId)}
              >
                Reset Preset
              </button>

              <div className="text-sm text-zinc-400">{scenario.description}</div>
            </div>
          </div>

          <div className="grid gap-4 2xl:grid-cols-[1.7fr_1fr]">
            <ChordView meta={visibleMeta} />

            <div className="space-y-4 2xl:min-w-[280px]">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/20 p-4">
                <div className="text-sm text-zinc-300">Run Setup</div>
                <div className="mt-3 grid gap-3">
                  <label className="space-y-1 text-xs text-zinc-400">
                    <span>Node IDs</span>
                    <input
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100"
                      value={nodeInput}
                      onChange={(event) => setNodeInput(event.target.value)}
                    />
                  </label>

                  <button
                    className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-900"
                    onClick={applyNodeInput}
                  >
                    Apply Nodes
                  </button>

                  <label className="space-y-1 text-xs text-zinc-400">
                    <span>Start Node</span>
                    <input
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100"
                      type="number"
                      min={0}
                      max={2 ** config.m - 1}
                      value={config.startNode}
                      onChange={(event) =>
                        updateConfig((current) => ({
                          ...current,
                          startNode: Number(event.target.value) || 0,
                        }))
                      }
                    />
                  </label>

                  <label className="space-y-1 text-xs text-zinc-400">
                    <span>Lookup Key</span>
                    <input
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100"
                      type="number"
                      min={0}
                      max={2 ** config.m - 1}
                      value={config.key}
                      onChange={(event) =>
                        updateConfig((current) => ({
                          ...current,
                          key: Number(event.target.value) || 0,
                        }))
                      }
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <PlayerControls onPlay={loadSteps} />
        </div>
      }
    />
  );
}
