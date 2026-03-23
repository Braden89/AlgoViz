import type { CSSProperties } from "react";
import type { PaxosMeta, PaxosNodeState } from "../algorithms/networking/paxos";

type Position = {
  x: number;
  y: number;
};

const NODE_POSITIONS: Record<string, Position> = {
  C1: { x: 390, y: 72 },
  P1: { x: 390, y: 198 },
  A1: { x: 110, y: 380 },
  A2: { x: 250, y: 380 },
  A3: { x: 390, y: 380 },
  A4: { x: 530, y: 380 },
  A5: { x: 670, y: 380 },
  L1: { x: 390, y: 592 },
};

const TREE_EDGES = [
  ["C1", "P1"],
  ["P1", "A1"],
  ["P1", "A2"],
  ["P1", "A3"],
  ["P1", "A4"],
  ["P1", "A5"],
  ["A1", "L1"],
  ["A2", "L1"],
  ["A3", "L1"],
  ["A4", "L1"],
  ["A5", "L1"],
] as const;

function roleTone(role: PaxosNodeState["role"]) {
  switch (role) {
    case "client":
      return "border-cyan-700/70 bg-cyan-950/35";
    case "proposer":
      return "border-violet-700/70 bg-violet-950/35";
    case "acceptor":
      return "border-emerald-700/70 bg-emerald-950/25";
    case "learner":
      return "border-amber-700/70 bg-amber-950/25";
  }
}

function statusTone(node: PaxosNodeState) {
  if (node.isOffline) return "text-zinc-500";
  if (node.status.includes("Chosen") || node.status.includes("Learns") || node.status.includes("Accepted")) {
    return "text-emerald-300";
  }
  if (node.status.includes("Reject") || node.status.includes("failed")) {
    return "text-red-300";
  }
  if (node.status.includes("Promised") || node.status.includes("Proposal")) {
    return "text-sky-300";
  }
  return "text-zinc-300";
}

function nodeStyle(id: string): CSSProperties {
  const position = NODE_POSITIONS[id] ?? { x: 0, y: 0 };
  return {
    left: position.x,
    top: position.y,
    transform: "translate(-50%, -50%)",
  };
}

function NodeCard({ node }: { node: PaxosNodeState }) {
  return (
    <div
      className={[
        "absolute w-36 rounded-2xl border p-3 shadow-[0_12px_36px_rgba(0,0,0,0.25)] transition",
        roleTone(node.role),
        node.isHighlighted ? "ring-2 ring-sky-400/80" : "ring-1 ring-transparent",
        node.isOffline ? "opacity-60 saturate-50" : "opacity-100",
      ].join(" ")}
      style={nodeStyle(node.id)}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-zinc-100">{node.label}</div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{node.role}</div>
      </div>

      <div className={`mt-2 text-sm ${statusTone(node)}`}>{node.status}</div>

      {node.details && node.details.length > 0 ? (
        <div className="mt-3 space-y-1 text-[11px] text-zinc-400">
          {node.details.map((detail) => (
            <div key={`${node.id}-${detail.label}`}>
              {detail.label}: {detail.value}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MessagePacket({ meta }: { meta: PaxosMeta }) {
  if (!meta.activeMessage) return null;

  const from = NODE_POSITIONS[meta.activeMessage.from];
  const to = NODE_POSITIONS[meta.activeMessage.to];
  if (!from || !to) return null;

  const left = Math.min(from.x, to.x);
  const top = Math.min(from.y, to.y);
  const width = Math.max(Math.abs(to.x - from.x), 1);
  const height = Math.max(Math.abs(to.y - from.y), 1);
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  const packetStyle = {
    "--packet-dx": `${dx}px`,
    "--packet-dy": `${dy}px`,
  } as CSSProperties;

  return (
    <>
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke="rgb(56 189 248 / 0.75)"
          strokeWidth="3"
          strokeDasharray="8 8"
        />
      </svg>

      <div
        className="pointer-events-none absolute z-20 overflow-visible"
        style={{
          left,
          top,
          width,
          height,
        }}
      >
        <div
          className="paxos-packet absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300/80 bg-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.65)]"
          style={{
            left: from.x - left,
            top: from.y - top,
            ...packetStyle,
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute z-20 rounded-lg border border-sky-700/70 bg-sky-950/85 px-3 py-2 text-xs text-sky-100 shadow-[0_12px_24px_rgba(0,0,0,0.25)]"
        style={{
          left: (from.x + to.x) / 2,
          top: (from.y + to.y) / 2 - 30,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="font-medium uppercase tracking-[0.16em] text-sky-300">{meta.activeMessage.kind}</div>
        <div className="mt-1">
          {meta.activeMessage.from} to {meta.activeMessage.to}
        </div>
        <div className="text-sky-200">
          {meta.activeMessage.proposalNumber ? `#${meta.activeMessage.proposalNumber}` : ""}
          {meta.activeMessage.value ? `  ${meta.activeMessage.value}` : ""}
        </div>
      </div>
    </>
  );
}

export function PaxosView({ meta }: { meta?: PaxosMeta }) {
  if (!meta) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/20 p-6 text-sm text-zinc-400">
        Press play to step through a Paxos round.
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
              Requested value <span className="text-zinc-100">{meta.requestedValue}</span>
              {" | "}
              Active proposal <span className="text-zinc-100">#{meta.proposalNumber}</span>
              {" | "}
              Current value <span className="text-zinc-100">{meta.proposedValue}</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 px-4 py-3 text-sm text-zinc-300">
            <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Chosen</div>
            <div className="mt-1 text-zinc-100">{meta.chosenValue ?? "Not chosen yet"}</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_34%),linear-gradient(180deg,rgba(24,24,27,0.95),rgba(9,9,11,0.98))] p-4">
        <div className="relative mx-auto h-[680px] min-w-[780px]">
          <svg className="absolute inset-0 h-full w-full">
            {TREE_EDGES.map(([from, to]) => {
              const source = NODE_POSITIONS[from];
              const target = NODE_POSITIONS[to];
              return (
                <line
                  key={`${from}-${to}`}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="rgb(63 63 70 / 0.9)"
                  strokeWidth="3"
                />
              );
            })}
          </svg>

          <MessagePacket meta={meta} />

          {meta.nodes.map((node) => (
            <NodeCard key={node.id} node={node} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4">
        <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Recent Events</div>
        <div className="mt-3 space-y-2">
          {meta.eventLog.map((item, index) => (
            <div
              key={`${index}-${item}`}
              className="rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-300"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
