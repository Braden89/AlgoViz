import type { PaxosMeta } from "../algorithms/networking/paxos";

function MetricCard(props: { label: string; value: string | number; tone?: "default" | "success" | "warning" }) {
  const toneClass =
    props.tone === "success"
      ? "text-emerald-300"
      : props.tone === "warning"
        ? "text-amber-300"
        : "text-zinc-100";

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
      <div className="text-xs text-zinc-400">{props.label}</div>
      <div className={`text-xl font-semibold ${toneClass}`}>{props.value}</div>
    </div>
  );
}

export function NetworkingMetricsPanel({ meta }: { meta?: PaxosMeta }) {
  const promisesTone = meta ? (meta.promiseCount >= meta.quorumSize ? "success" : "warning") : undefined;
  const acceptedTone = meta ? (meta.acceptedCount >= meta.quorumSize ? "success" : "warning") : undefined;

  return (
    <div className="grid grid-cols-2 gap-3">
      <MetricCard label="Proposal #" value={meta?.proposalNumber ?? "--"} />
      <MetricCard label="Quorum" value={meta ? meta.quorumSize : "--"} />
      <MetricCard label="Promises" value={meta?.promiseCount ?? 0} tone={promisesTone} />
      <MetricCard label="Accepted" value={meta?.acceptedCount ?? 0} tone={acceptedTone} />
    </div>
  );
}
