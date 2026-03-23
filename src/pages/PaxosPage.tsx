import { useState } from "react";
import { Link } from "react-router-dom";
import { AlgorithmLayout } from "../components/AlgorithmLayout";
import { NetworkingMetricsPanel } from "../components/NetworkingMetricsPanel";
import { PaxosView } from "../components/PaxosView";
import { PlayerControls } from "../components/PlayerControls";
import { PseudocodePanel } from "../components/PseudocodePanel";
import { StepInspector } from "../components/StepInspector";
import {
  Paxos,
  type PaxosConfig,
  type PaxosMeta,
  type PaxosNodeState,
  type PaxosScenarioId,
} from "../algorithms/networking/paxos";
import { usePlayerStore } from "../state/playerStore";
import type { Step } from "../algorithms/types";

function toNumberOrUndefined(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export default function PaxosPage() {
  const setSteps = usePlayerStore((store) => store.setSteps);
  const steps = usePlayerStore((store) => store.steps);
  const index = usePlayerStore((store) => store.index);

  const [scenarioId, setScenarioId] = useState<PaxosScenarioId>("fresh");
  const [config, setConfig] = useState<PaxosConfig>(() => Paxos.createConfig("fresh"));

  const scenario = Paxos.scenarios[scenarioId];
  const step = steps[index] as Step<PaxosMeta> | undefined;
  const visibleMeta = step?.meta ?? Paxos.previewMeta(config);

  const resetSteps = () => setSteps([]);

  const updateConfig = (updater: (current: PaxosConfig) => PaxosConfig) => {
    setConfig((current) => updater(current));
    resetSteps();
  };

  const updateAcceptor = (acceptorId: string, updater: (acceptor: PaxosNodeState) => PaxosNodeState) => {
    updateConfig((current) => ({
      ...current,
      acceptors: current.acceptors.map((acceptor) =>
        acceptor.id === acceptorId ? updater(acceptor) : acceptor,
      ),
    }));
  };

  const loadScenario = (nextScenarioId: PaxosScenarioId) => {
    setScenarioId(nextScenarioId);
    setConfig(Paxos.createConfig(nextScenarioId));
    resetSteps();
  };

  const loadSteps = () => {
    setSteps(Paxos.generateSteps(config));
  };

  return (
    <AlgorithmLayout
      title="Paxos Consensus"
      left={<PseudocodePanel pseudocode={Paxos.pseudocode} activeLine={step?.line ?? 0} />}
      right={
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm text-zinc-300">Overview</div>
              <div className="mt-2 text-sm text-zinc-400">
                Paxos reaches consensus by requiring a quorum of acceptors to promise and then accept the same proposal.
              </div>
            </div>

            <Link
              className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-900"
              to="/algorithms/networking"
            >
              &larr; Networking
            </Link>
          </div>

          <NetworkingMetricsPanel meta={visibleMeta} />
          <StepInspector items={step?.inspector} />

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-3 text-sm text-zinc-400">
            {step?.note ?? scenario.description}
          </div>

          <div className="text-xs text-zinc-500">
            Turn off acceptors or preload accepted values to see how quorum and safety change before you hit play.
          </div>
        </div>
      }
      bottom={
        <div className="space-y-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/20 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <div className="text-sm text-zinc-300">Scenario</div>
                <div className="text-xs text-zinc-500">Load a preset, then customize the network before running it.</div>
              </div>

              <select
                className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm"
                value={scenarioId}
                onChange={(event) => loadScenario(event.target.value as PaxosScenarioId)}
              >
                {Object.values(Paxos.scenarios).map((entry) => (
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
            <PaxosView meta={visibleMeta} />

            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/20 p-4">
                <div className="text-sm text-zinc-300">Run Setup</div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-xs text-zinc-400">
                    <span>Proposal Number</span>
                    <input
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100"
                      type="number"
                      min={1}
                      value={config.proposalNumber}
                      onChange={(event) =>
                        updateConfig((current) => ({
                          ...current,
                          proposalNumber: Math.max(1, Number(event.target.value) || 1),
                        }))
                      }
                    />
                  </label>

                  <label className="space-y-1 text-xs text-zinc-400">
                    <span>Client Value</span>
                    <input
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100"
                      value={config.clientValue}
                      onChange={(event) =>
                        updateConfig((current) => ({
                          ...current,
                          clientValue: event.target.value,
                        }))
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-zinc-300">Node Controls</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      Toggle acceptors online or preload their promised and accepted state.
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {config.acceptors.map((acceptor) => (
                    <div key={acceptor.id} className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-zinc-100">{acceptor.label}</div>
                          <div className="text-xs text-zinc-500">
                            {acceptor.isOffline ? "Offline before the run" : "Online and available"}
                          </div>
                        </div>

                        <label className="flex items-center gap-2 text-xs text-zinc-300">
                          <input
                            type="checkbox"
                            checked={!acceptor.isOffline}
                            onChange={(event) =>
                              updateAcceptor(acceptor.id, (current) => ({
                                ...current,
                                isOffline: !event.target.checked,
                                status: event.target.checked ? "Waiting" : "Offline",
                              }))
                            }
                          />
                          Online
                        </label>
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <label className="space-y-1 text-xs text-zinc-400">
                          <span>Promised #</span>
                          <input
                            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 disabled:opacity-50"
                            value={acceptor.promisedNumber ?? ""}
                            disabled={Boolean(acceptor.isOffline)}
                            onChange={(event) =>
                              updateAcceptor(acceptor.id, (current) => ({
                                ...current,
                                promisedNumber: toNumberOrUndefined(event.target.value),
                              }))
                            }
                          />
                        </label>

                        <label className="space-y-1 text-xs text-zinc-400">
                          <span>Accepted #</span>
                          <input
                            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 disabled:opacity-50"
                            value={acceptor.acceptedNumber ?? ""}
                            disabled={Boolean(acceptor.isOffline)}
                            onChange={(event) =>
                              updateAcceptor(acceptor.id, (current) => ({
                                ...current,
                                acceptedNumber: toNumberOrUndefined(event.target.value),
                              }))
                            }
                          />
                        </label>

                        <label className="space-y-1 text-xs text-zinc-400">
                          <span>Accepted Value</span>
                          <input
                            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 disabled:opacity-50"
                            value={acceptor.acceptedValue ?? ""}
                            disabled={Boolean(acceptor.isOffline)}
                            onChange={(event) =>
                              updateAcceptor(acceptor.id, (current) => ({
                                ...current,
                                acceptedValue: event.target.value,
                              }))
                            }
                          />
                        </label>
                      </div>
                    </div>
                  ))}
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
