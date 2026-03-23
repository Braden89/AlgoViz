import type { ChordMeta } from "../algorithms/networking/chord";

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

export function ChordMetricsPanel({ meta }: { meta?: ChordMeta }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <MetricCard label="Ring Size" value={meta?.ringSize ?? "--"} />
      <MetricCard label="Key" value={meta?.key ?? "--"} />
      <MetricCard label="Hops" value={meta?.hopCount ?? 0} tone={meta && meta.hopCount > 2 ? "warning" : "default"} />
      <MetricCard label="Responsible" value={meta?.responsibleNode ?? "--"} tone="success" />
    </div>
  );
}
