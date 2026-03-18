import type { Metrics } from "../algorithms/types";
import type { SearchStep } from "../algorithms/search/searchtypes";

export function SearchMetricsPanel(props: {
  metrics: Metrics | undefined;
  step: SearchStep | undefined;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
        <div className="text-xs text-zinc-400">Neighbor Checks</div>
        <div className="text-xl font-semibold">{props.metrics?.comparisons ?? 0}</div>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
        <div className="text-xs text-zinc-400">Visited Nodes</div>
        <div className="text-xl font-semibold">{props.step?.visitedIds.length ?? 0}</div>
      </div>
    </div>
  );
}
