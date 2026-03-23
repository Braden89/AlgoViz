import { useState } from "react";
import { Link } from "react-router-dom";
import { AlgorithmLayout } from "../components/AlgorithmLayout";
import { PlayerControls } from "../components/PlayerControls";
import { PseudocodePanel } from "../components/PseudocodePanel";
import { Rdt30View } from "../components/Rdt30View";
import { RdtMetricsPanel } from "../components/RdtMetricsPanel";
import { StepInspector } from "../components/StepInspector";
import { Rdt30, type RdtConfig, type RdtMeta, type RdtScenarioId } from "../algorithms/networking/rdt30";
import { usePlayerStore } from "../state/playerStore";
import type { Step } from "../algorithms/types";

export default function Rdt30Page() {
  const setSteps = usePlayerStore((store) => store.setSteps);
  const steps = usePlayerStore((store) => store.steps);
  const index = usePlayerStore((store) => store.index);

  const [scenarioId, setScenarioId] = useState<RdtScenarioId>("clean");
  const [config, setConfig] = useState<RdtConfig>(() => Rdt30.createConfig("clean"));

  const scenario = Rdt30.scenarios[scenarioId];
  const step = steps[index] as Step<RdtMeta> | undefined;
  const visibleMeta = step?.meta ?? Rdt30.previewMeta(config);

  const resetSteps = () => setSteps([]);

  const updateConfig = (updater: (current: RdtConfig) => RdtConfig) => {
    setConfig((current) => updater(current));
    resetSteps();
  };

  const loadScenario = (nextScenarioId: RdtScenarioId) => {
    setScenarioId(nextScenarioId);
    setConfig(Rdt30.createConfig(nextScenarioId));
    resetSteps();
  };

  const loadSteps = () => {
    setSteps(Rdt30.generateSteps(config));
  };

  return (
    <AlgorithmLayout
      title="Reliable Data Transfer 3.0"
      left={<PseudocodePanel pseudocode={Rdt30.pseudocode} activeLine={step?.line ?? 0} />}
      right={
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm text-zinc-300">Overview</div>
              <div className="mt-2 text-sm text-zinc-400">
                RDT 3.0 uses sequence numbers, ACKs, and timeouts to achieve reliable delivery over a lossy or corrupt channel.
              </div>
            </div>

            <Link
              className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-900"
              to="/algorithms/networking"
            >
              &larr; Networking
            </Link>
          </div>

          <RdtMetricsPanel meta={visibleMeta} />
          <StepInspector items={step?.inspector} />

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-3 text-sm text-zinc-400">
            {step?.note ?? scenario.description}
          </div>

          <div className="text-xs text-zinc-500">
            Try dropping the first data packet or corrupting the first ACK to see why RDT 3.0 needs timers and retransmissions.
          </div>
        </div>
      }
      bottom={
        <div className="space-y-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/20 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <div className="text-sm text-zinc-300">Scenario</div>
                <div className="text-xs text-zinc-500">Load a preset, then customize the unreliable channel.</div>
              </div>

              <select
                className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm"
                value={scenarioId}
                onChange={(event) => loadScenario(event.target.value as RdtScenarioId)}
              >
                {Object.values(Rdt30.scenarios).map((entry) => (
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

          <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
            <Rdt30View meta={visibleMeta} />

            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/20 p-4">
                <div className="text-sm text-zinc-300">Run Setup</div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-xs text-zinc-400">
                    <span>Message</span>
                    <input
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100"
                      value={config.message}
                      onChange={(event) =>
                        updateConfig((current) => ({
                          ...current,
                          message: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="space-y-1 text-xs text-zinc-400">
                    <span>Starting Seq</span>
                    <select
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100"
                      value={config.senderSeq}
                      onChange={(event) =>
                        updateConfig((current) => ({
                          ...current,
                          senderSeq: Number(event.target.value) as 0 | 1,
                          receiverExpectedSeq: Number(event.target.value) as 0 | 1,
                        }))
                      }
                    >
                      <option value={0}>0</option>
                      <option value={1}>1</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/20 p-4">
                <div className="text-sm text-zinc-300">Channel Controls</div>
                <div className="mt-1 text-xs text-zinc-500">
                  Apply a failure to the first data packet or first ACK.
                </div>

                <div className="mt-4 space-y-3 text-sm text-zinc-300">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={config.dropFirstData}
                      onChange={(event) =>
                        updateConfig((current) => ({
                          ...current,
                          dropFirstData: event.target.checked,
                          corruptFirstData: event.target.checked ? false : current.corruptFirstData,
                        }))
                      }
                    />
                    Drop first data packet
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={config.corruptFirstData}
                      onChange={(event) =>
                        updateConfig((current) => ({
                          ...current,
                          corruptFirstData: event.target.checked,
                          dropFirstData: event.target.checked ? false : current.dropFirstData,
                        }))
                      }
                    />
                    Corrupt first data packet
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={config.dropFirstAck}
                      onChange={(event) =>
                        updateConfig((current) => ({
                          ...current,
                          dropFirstAck: event.target.checked,
                          corruptFirstAck: event.target.checked ? false : current.corruptFirstAck,
                        }))
                      }
                    />
                    Drop first ACK
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={config.corruptFirstAck}
                      onChange={(event) =>
                        updateConfig((current) => ({
                          ...current,
                          corruptFirstAck: event.target.checked,
                          dropFirstAck: event.target.checked ? false : current.dropFirstAck,
                        }))
                      }
                    />
                    Corrupt first ACK
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
