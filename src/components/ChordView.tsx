import { useMemo, useRef, useState } from "react";
import type { CSSProperties, MouseEventHandler, WheelEventHandler } from "react";
import type { ChordMeta } from "../algorithms/networking/chord";

const CENTER_X = 460;
const CENTER_Y = 360;
const RADIUS = 240;
const CARD_OFFSET = 90;
const CONTENT_WIDTH = 920;
const CONTENT_HEIGHT = 760;
const VIEWPORT_PAD = 120;

function polar(hash: number, ringSize: number) {
  const angle = (hash / ringSize) * Math.PI * 2 - Math.PI / 2;
  return {
    angle,
    x: CENTER_X + Math.cos(angle) * RADIUS,
    y: CENTER_Y + Math.sin(angle) * RADIUS,
  };
}

function packetStyle(meta: ChordMeta): CSSProperties | undefined {
  if (!meta.activeMessage) return undefined;
  const fromHash = Number(meta.activeMessage.from.slice(1));
  const toHash = Number(meta.activeMessage.to.slice(1));
  const from = polar(fromHash, meta.ringSize);
  const to = polar(toHash, meta.ringSize);
  return {
    left: from.x,
    top: from.y,
    "--packet-dx": `${to.x - from.x}px`,
    "--packet-dy": `${to.y - from.y}px`,
  } as CSSProperties;
}

export function ChordView({ meta }: { meta?: ChordMeta }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);

  const clampZoom = (value: number) => Math.max(0.6, Math.min(2, value));

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const canvasWidth = useMemo(() => Math.ceil(CONTENT_WIDTH + VIEWPORT_PAD * 2), []);
  const canvasHeight = useMemo(() => Math.ceil(CONTENT_HEIGHT + VIEWPORT_PAD * 2), []);

  const onWheel: WheelEventHandler<SVGSVGElement> = (event) => {
    event.preventDefault();
    const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
    const nextZoom = clampZoom(zoom * factor);

    const rect = event.currentTarget.getBoundingClientRect();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;

    const wx = (mx - VIEWPORT_PAD - pan.x) / zoom;
    const wy = (my - VIEWPORT_PAD - pan.y) / zoom;

    setZoom(nextZoom);
    setPan({
      x: mx - VIEWPORT_PAD - wx * nextZoom,
      y: my - VIEWPORT_PAD - wy * nextZoom,
    });
  };

  const onMouseDown: MouseEventHandler<SVGSVGElement> = (event) => {
    isPanningRef.current = true;
    lastRef.current = { x: event.clientX, y: event.clientY };
  };

  const onMouseMove: MouseEventHandler<SVGSVGElement> = (event) => {
    if (!isPanningRef.current || !lastRef.current) return;
    const dx = event.clientX - lastRef.current.x;
    const dy = event.clientY - lastRef.current.y;
    lastRef.current = { x: event.clientX, y: event.clientY };
    setPan((current) => ({ x: current.x + dx, y: current.y + dy }));
  };

  const endPan = () => {
    isPanningRef.current = false;
    lastRef.current = null;
  };

  if (!meta) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/20 p-6 text-sm text-zinc-400">
        Press play to route a Chord lookup around the ring.
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
              Start <span className="text-zinc-100">N{meta.startNode}</span>
              {" | "}
              Lookup key <span className="text-zinc-100">{meta.key}</span>
              {" | "}
              Responsible <span className="text-zinc-100">N{meta.responsibleNode}</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 px-4 py-3 text-sm text-zinc-300">
            <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Path</div>
            <div className="mt-1 text-zinc-100">{meta.path.map((hash) => `N${hash}`).join(" -> ")}</div>
          </div>
        </div>
      </div>

      <div className="space-y-2 overflow-hidden rounded-2xl border border-zinc-800 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_34%),linear-gradient(180deg,rgba(24,24,27,0.95),rgba(9,9,11,0.98))] p-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400">Zoom</span>
          <input
            className="w-48"
            type="range"
            min={0.6}
            max={2}
            step={0.05}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
          <div className="w-14 text-xs text-zinc-400">{Math.round(zoom * 100)}%</div>
          <button
            className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-1 text-xs hover:bg-zinc-900"
            onClick={resetView}
          >
            Reset
          </button>
        </div>

        <div className="relative h-[620px] overflow-hidden overscroll-contain rounded-xl border border-zinc-800/70">
          <svg
            width={canvasWidth}
            height={canvasHeight}
            onWheel={onWheel}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={endPan}
            onMouseLeave={endPan}
            style={{
              cursor: isPanningRef.current ? "grabbing" : "grab",
              display: "block",
              width: "100%",
              height: "100%",
              overflow: "hidden",
            }}
          >
            <g transform={`translate(${VIEWPORT_PAD + pan.x}, ${VIEWPORT_PAD + pan.y}) scale(${zoom})`}>
              <circle cx={CENTER_X} cy={CENTER_Y} r={RADIUS} fill="none" stroke="rgb(63 63 70 / 0.9)" strokeWidth="3" />

              {meta.nodes.map((node) => {
                const point = polar(node.hash, meta.ringSize);
                return (
                  <g key={`axis-${node.id}`}>
                    <line x1={CENTER_X} y1={CENTER_Y} x2={point.x} y2={point.y} stroke="rgb(39 39 42 / 0.5)" strokeWidth="1" />
                    <text x={point.x} y={point.y - 34} textAnchor="middle" fontSize="11" fill="rgb(161 161 170)">
                      {node.hash}
                    </text>
                  </g>
                );
              })}

              {meta.activeMessage ? (
                <foreignObject x="0" y="0" width={CONTENT_WIDTH} height={CONTENT_HEIGHT} overflow="visible">
                  <div
                    key={meta.activeMessage.id}
                    className="paxos-packet absolute z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300/80 bg-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.65)]"
                    style={packetStyle(meta)}
                  />
                </foreignObject>
              ) : null}

              {meta.nodes.map((node) => {
                const point = polar(node.hash, meta.ringSize);
                const cardLeft = CENTER_X + Math.cos(point.angle) * (RADIUS + CARD_OFFSET);
                const cardTop = CENTER_Y + Math.sin(point.angle) * (RADIUS + CARD_OFFSET);
                return (
                  <foreignObject
                    key={node.id}
                    x={cardLeft - 90}
                    y={cardTop - 88}
                    width={180}
                    height={190}
                    overflow="hidden"
                  >
                    <div
                      className={[
                        "w-44 rounded-2xl border p-3 shadow-[0_12px_36px_rgba(0,0,0,0.25)]",
                        node.isHighlighted ? "border-sky-400 bg-sky-950/25 ring-2 ring-sky-400/70" : "border-zinc-700 bg-zinc-950/35",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-zinc-100">{node.label}</div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Node</div>
                      </div>
                      <div className="mt-2 text-sm text-zinc-300">{node.status}</div>
                      <div className="mt-3 space-y-1 text-[11px] text-zinc-400">
                        {node.details.map((detail) => (
                          <div key={`${node.id}-${detail.label}`}>
                            {detail.label}: {detail.value}
                          </div>
                        ))}
                      </div>
                    </div>
                  </foreignObject>
                );
              })}

              {(() => {
                const keyPoint = polar(meta.key, meta.ringSize);
                return (
                  <foreignObject x={keyPoint.x - 38} y={keyPoint.y - 18} width={80} height={36} overflow="hidden">
                    <div className="rounded-full border border-amber-400/80 bg-amber-400/20 px-3 py-1 text-center text-xs font-medium text-amber-200">
                      Key {meta.key}
                    </div>
                  </foreignObject>
                );
              })()}
            </g>
          </svg>
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
