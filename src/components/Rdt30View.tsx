import type { CSSProperties } from "react";
import type { RdtMeta, RdtNodeState } from "../algorithms/networking/rdt30";

const NODE_POSITIONS = {
  S: { x: 160, y: 230 },
  C: { x: 390, y: 230 },
  R: { x: 620, y: 230 },
};

function roleTone(role: RdtNodeState["role"]) {
  switch (role) {
    case "sender":
      return "border-cyan-700/70 bg-cyan-950/30";
    case "channel":
      return "border-fuchsia-700/70 bg-fuchsia-950/25";
    case "receiver":
      return "border-emerald-700/70 bg-emerald-950/25";
  }
}

function packetTone(meta: RdtMeta) {
  if (!meta.activePacket) return "border-sky-300/80 bg-sky-400";
  if (meta.activePacket.state === "lost") return "border-red-300/80 bg-red-400";
  if (meta.activePacket.state === "corrupt") return "border-amber-300/80 bg-amber-400";
  return "border-sky-300/80 bg-sky-400";
}

function nodeStyle(id: keyof typeof NODE_POSITIONS): CSSProperties {
  const position = NODE_POSITIONS[id];
  return {
    left: position.x,
    top: position.y,
    transform: "translate(-50%, -50%)",
  };
}

function NodeCard({ node }: { node: RdtNodeState }) {
  return (
    <div
      className={[
        "absolute w-40 rounded-2xl border p-4 shadow-[0_12px_36px_rgba(0,0,0,0.25)]",
        roleTone(node.role),
        node.isHighlighted ? "ring-2 ring-sky-400/80" : "ring-1 ring-transparent",
      ].join(" ")}
      style={nodeStyle(node.id as keyof typeof NODE_POSITIONS)}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-zinc-100">{node.label}</div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{node.role}</div>
      </div>

      <div className="mt-2 text-sm text-zinc-200">{node.status}</div>

      <div className="mt-3 space-y-1 text-[11px] text-zinc-400">
        {node.details.map((detail) => (
          <div key={`${node.id}-${detail.label}`}>
            {detail.label}: {detail.value}
          </div>
        ))}
      </div>
    </div>
  );
}

function Packet({ meta }: { meta: RdtMeta }) {
  if (!meta.activePacket) return null;
  const from = NODE_POSITIONS[meta.activePacket.from as keyof typeof NODE_POSITIONS];
  const to = NODE_POSITIONS[meta.activePacket.to as keyof typeof NODE_POSITIONS];
  if (!from || !to) return null;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const left = Math.min(from.x, to.x);
  const top = Math.min(from.y, to.y);
  const width = Math.max(Math.abs(dx), 1);
  const height = Math.max(Math.abs(dy), 1);

  const packetStyle = {
    "--packet-dx": `${dx}px`,
    "--packet-dy": `${dy}px`,
  } as CSSProperties;

  return (
    <>
      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke={meta.activePacket.state === "lost" ? "rgb(248 113 113 / 0.75)" : meta.activePacket.state === "corrupt" ? "rgb(251 191 36 / 0.75)" : "rgb(56 189 248 / 0.75)"}
          strokeWidth="3"
          strokeDasharray="8 8"
        />
      </svg>

      <div className="pointer-events-none absolute z-20" style={{ left, top, width, height }}>
        <div
          key={`${meta.activePacket.id}-${meta.activePacket.kind}-${meta.activePacket.from}-${meta.activePacket.to}-${meta.activePacket.state}`}
          className={[
            "paxos-packet absolute -translate-x-1/2 -translate-y-1/2 rounded-full border shadow-[0_0_24px_rgba(56,189,248,0.65)]",
            packetTone(meta),
          ].join(" ")}
          style={{
            left: from.x - left,
            top: from.y - top,
            ...packetStyle,
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute z-20 rounded-lg border border-zinc-700 bg-zinc-950/90 px-3 py-2 text-xs text-zinc-100"
        style={{
          left: (from.x + to.x) / 2,
          top: (from.y + to.y) / 2 - 34,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="font-medium uppercase tracking-[0.16em] text-zinc-300">{meta.activePacket.kind}</div>
        <div className="mt-1">seq {meta.activePacket.seq}</div>
        {meta.activePacket.payload ? <div>{meta.activePacket.payload}</div> : null}
        {meta.activePacket.ackFor !== undefined ? <div>ack {meta.activePacket.ackFor}</div> : null}
      </div>
    </>
  );
}

export function Rdt30View({ meta }: { meta?: RdtMeta }) {
  if (!meta) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/20 p-6 text-sm text-zinc-400">
        Press play to step through an RDT 3.0 transfer.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">{meta.phase}</div>
            <div className="mt-1 text-lg font-semibold text-zinc-100">{meta.title}</div>
            <div className="mt-2 text-sm text-zinc-300">
              Message <span className="text-zinc-100">{meta.message}</span>
              {" | "}
              Sender seq <span className="text-zinc-100">{meta.senderSeq}</span>
              {" | "}
              Receiver expects <span className="text-zinc-100">{meta.receiverExpectedSeq}</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 px-4 py-3 text-sm text-zinc-300">
            <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Delivered</div>
            <div className="mt-1 text-zinc-100">{meta.deliveredMessage || "Not yet delivered"}</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_34%),linear-gradient(180deg,rgba(24,24,27,0.95),rgba(9,9,11,0.98))] p-4">
        <div className="relative mx-auto h-[440px] min-w-[780px]">
          <svg className="absolute inset-0 h-full w-full">
            <line x1={160} y1={230} x2={390} y2={230} stroke="rgb(63 63 70 / 0.9)" strokeWidth="3" />
            <line x1={390} y1={230} x2={620} y2={230} stroke="rgb(63 63 70 / 0.9)" strokeWidth="3" />
          </svg>

          <Packet meta={meta} />
          {meta.nodes.map((node) => (
            <NodeCard key={node.id} node={node} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4">
        <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Recent Events</div>
        <div className="mt-3 space-y-2">
          {meta.eventLog.map((item, index) => (
            <div key={`${index}-${item}`} className="rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-300">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
