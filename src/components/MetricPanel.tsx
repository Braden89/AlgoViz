import type { Metrics } from "../algorithms/types";

export function MetricsPanel({ metrics }: { metrics: Metrics | undefined }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
        <div className="text-xs text-zinc-400">Comparisons</div>
        <div className="text-xl font-semibold">{metrics?.comparisons ?? 0}</div>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
        <div className="text-xs text-zinc-400">Swaps</div>
        <div className="text-xl font-semibold">{metrics?.swaps ?? 0}</div>
      </div>
    </div>
  );
}
