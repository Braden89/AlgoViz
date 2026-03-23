import type { RdtMeta } from "../algorithms/networking/rdt30";

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

export function RdtMetricsPanel({ meta }: { meta?: RdtMeta }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <MetricCard label="Sender Seq" value={meta?.senderSeq ?? "--"} />
      <MetricCard label="Receiver Expect" value={meta?.receiverExpectedSeq ?? "--"} />
      <MetricCard label="Packets Sent" value={meta?.transmissionCount ?? 0} />
      <MetricCard
        label="Retransmits"
        value={meta?.retransmissionCount ?? 0}
        tone={meta && meta.retransmissionCount > 0 ? "warning" : "default"}
      />
    </div>
  );
}
