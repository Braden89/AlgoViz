import type { ClassifiedPoint, PlotPoint } from "../algorithms/machine-learning/types";

type NeighborEntry = {
  point: ClassifiedPoint;
  distance: number;
};

type KNearestNeighborsViewProps = {
  points: ClassifiedPoint[];
  queryPoint: PlotPoint;
  neighbors: NeighborEntry[];
  predictedLabel: 0 | 1;
  radius: number;
  xDomain?: [number, number];
  yDomain?: [number, number];
  title?: string;
};

function formatTick(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function KNearestNeighborsView({
  points,
  queryPoint,
  neighbors,
  predictedLabel,
  radius,
  xDomain = [0, 12],
  yDomain = [0, 48],
  title = "K-Nearest Neighbors",
}: KNearestNeighborsViewProps) {
  const width = 760;
  const height = 420;
  const margin = { top: 28, right: 28, bottom: 54, left: 62 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const ticks = 5;

  const [minX, maxX] = xDomain;
  const [minY, maxY] = yDomain;

  const scaleX = (value: number) =>
    margin.left + ((value - minX) / (maxX - minX)) * innerWidth;

  const scaleY = (value: number) =>
    height - margin.bottom - ((value - minY) / (maxY - minY)) * innerHeight;

  const radiusScaleX = (value: number) => value * innerWidth;
  const radiusScaleY = (value: number) => value * innerHeight;

  const xTicks = Array.from({ length: ticks + 1 }, (_, index) => minX + ((maxX - minX) * index) / ticks);
  const yTicks = Array.from({ length: ticks + 1 }, (_, index) => minY + ((maxY - minY) * index) / ticks);
  const neighborIds = new Set(neighbors.map((entry) => `${entry.point.x}-${entry.point.y}-${entry.point.label}`));

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-zinc-100">{title}</div>
          <div className="text-xs text-zinc-500">Gold is the query point, and the highlighted points are the current nearest neighbors.</div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-1 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
            <span>Class A</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span>Class B</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span>Query</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[640px] rounded-xl bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.08),_transparent_40%),linear-gradient(to_bottom,_rgba(24,24,27,0.95),_rgba(9,9,11,0.95))]"
          role="img"
          aria-label={title}
        >
          {xTicks.map((tick) => {
            const x = scaleX(tick);
            return (
              <g key={`x-${tick}`}>
                <line x1={x} y1={margin.top} x2={x} y2={height - margin.bottom} stroke="rgba(244, 244, 245, 0.08)" strokeWidth="1" />
                <text x={x} y={height - margin.bottom + 22} textAnchor="middle" fill="rgb(161 161 170)" fontSize="11">
                  {formatTick(tick)}
                </text>
              </g>
            );
          })}

          {yTicks.map((tick) => {
            const y = scaleY(tick);
            return (
              <g key={`y-${tick}`}>
                <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="rgba(244, 244, 245, 0.08)" strokeWidth="1" />
                <text x={margin.left - 10} y={y + 4} textAnchor="end" fill="rgb(161 161 170)" fontSize="11">
                  {formatTick(tick)}
                </text>
              </g>
            );
          })}

          <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="rgb(113 113 122)" strokeWidth="1.5" />
          <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="rgb(113 113 122)" strokeWidth="1.5" />

          {radius > 0 ? (
            <ellipse
              cx={scaleX(queryPoint.x)}
              cy={scaleY(queryPoint.y)}
              rx={radiusScaleX(radius)}
              ry={radiusScaleY(radius)}
              fill={predictedLabel === 1 ? "rgba(248, 113, 113, 0.08)" : "rgba(96, 165, 250, 0.08)"}
              stroke={predictedLabel === 1 ? "rgba(248, 113, 113, 0.35)" : "rgba(96, 165, 250, 0.35)"}
              strokeWidth="2"
              strokeDasharray="8 8"
            />
          ) : null}

          {neighbors.map((entry, index) => (
            <line
              key={`neighbor-line-${index}`}
              x1={scaleX(queryPoint.x)}
              y1={scaleY(queryPoint.y)}
              x2={scaleX(entry.point.x)}
              y2={scaleY(entry.point.y)}
              stroke="rgba(250, 204, 21, 0.55)"
              strokeWidth="2"
            />
          ))}

          {points.map((point, index) => {
            const pointKey = `${point.x}-${point.y}-${point.label}`;
            const isNeighbor = neighborIds.has(pointKey);
            return (
              <g key={`${pointKey}-${index}`}>
                {isNeighbor ? (
                  <circle
                    cx={scaleX(point.x)}
                    cy={scaleY(point.y)}
                    r="9"
                    fill="transparent"
                    stroke="rgb(250 204 21)"
                    strokeWidth="2.5"
                    opacity="0.95"
                  />
                ) : null}
                <circle
                  cx={scaleX(point.x)}
                  cy={scaleY(point.y)}
                  r="5"
                  fill={point.className === "classB" ? "rgb(248 113 113)" : "rgb(96 165 250)"}
                  fillOpacity="0.9"
                  stroke={point.className === "classB" ? "rgb(254 226 226)" : "rgb(239 246 255)"}
                  strokeOpacity="0.65"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}

          <circle
            cx={scaleX(queryPoint.x)}
            cy={scaleY(queryPoint.y)}
            r="7"
            fill={predictedLabel === 1 ? "rgb(251 191 36)" : "rgb(253 224 71)"}
            stroke="rgb(254 249 195)"
            strokeWidth="2"
          />

          <text x={width / 2} y={height - 14} textAnchor="middle" fill="rgb(212 212 216)" fontSize="12">
            Feature x1
          </text>
          <text x={18} y={height / 2} textAnchor="middle" fill="rgb(212 212 216)" fontSize="12" transform={`rotate(-90 18 ${height / 2})`}>
            Feature x2
          </text>
        </svg>
      </div>
    </div>
  );
}
