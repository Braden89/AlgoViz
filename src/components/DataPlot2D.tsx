import type { FittedLine, PlotPoint } from "../algorithms/machine-learning/types";

type DataPlot2DProps = {
  points: PlotPoint[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
  className?: string;
  xDomain?: [number, number];
  yDomain?: [number, number];
  fittedLine?: FittedLine;
};

type Bounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

function padBounds(min: number, max: number) {
  if (min === max) {
    return { min: min - 1, max: max + 1 };
  }

  const span = max - min;
  const padding = span * 0.1;
  return { min: min - padding, max: max + padding };
}

function getBounds(points: PlotPoint[]): Bounds {
  if (points.length === 0) {
    return { minX: 0, maxX: 10, minY: 0, maxY: 10 };
  }

  const xValues = points.map((point) => point.x);
  const yValues = points.map((point) => point.y);

  const paddedX = padBounds(Math.min(...xValues), Math.max(...xValues));
  const paddedY = padBounds(Math.min(...yValues), Math.max(...yValues));

  return {
    minX: paddedX.min,
    maxX: paddedX.max,
    minY: paddedY.min,
    maxY: paddedY.max,
  };
}

function formatTick(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function DataPlot2D({
  points,
  title = "2D Data Plot",
  xLabel = "x",
  yLabel = "y",
  className = "",
  xDomain,
  yDomain,
  fittedLine,
}: DataPlot2DProps) {
  const width = 760;
  const height = 420;
  const margin = { top: 28, right: 28, bottom: 54, left: 62 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const pointBounds = getBounds(points);
  const bounds = {
    minX: xDomain ? xDomain[0] : pointBounds.minX,
    maxX: xDomain ? xDomain[1] : pointBounds.maxX,
    minY: yDomain ? yDomain[0] : pointBounds.minY,
    maxY: yDomain ? yDomain[1] : pointBounds.maxY,
  };
  const ticks = 5;

  const scaleX = (value: number) =>
    margin.left + ((value - bounds.minX) / (bounds.maxX - bounds.minX)) * innerWidth;

  const scaleY = (value: number) =>
    height - margin.bottom - ((value - bounds.minY) / (bounds.maxY - bounds.minY)) * innerHeight;

  const xTicks = Array.from({ length: ticks + 1 }, (_, index) => {
    const ratio = index / ticks;
    return bounds.minX + (bounds.maxX - bounds.minX) * ratio;
  });

  const yTicks = Array.from({ length: ticks + 1 }, (_, index) => {
    const ratio = index / ticks;
    return bounds.minY + (bounds.maxY - bounds.minY) * ratio;
  });

  const hasSecondClass = points.some((point) => point.className === "classB");
  const zeroX = bounds.minX <= 0 && bounds.maxX >= 0 ? scaleX(0) : null;
  const zeroY = bounds.minY <= 0 && bounds.maxY >= 0 ? scaleY(0) : null;

  return (
    <div className={`rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4 ${className}`.trim()}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-zinc-100">{title}</div>
          <div className="text-xs text-zinc-500">Randomized sample points for the current function shape.</div>
        </div>
        <div className="flex items-center gap-2">
          {hasSecondClass ? (
            <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-1 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                <span>Class A</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span>Class B</span>
              </div>
            </div>
          ) : null}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-1 text-xs text-zinc-400">
            {points.length} points
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[640px] rounded-xl bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.08),_transparent_45%),linear-gradient(to_bottom,_rgba(24,24,27,0.95),_rgba(9,9,11,0.95))]"
          role="img"
          aria-label={title}
        >
          {xTicks.map((tick) => {
            const x = scaleX(tick);
            return (
              <g key={`x-${tick}`}>
                <line
                  x1={x}
                  y1={margin.top}
                  x2={x}
                  y2={height - margin.bottom}
                  stroke="rgba(244, 244, 245, 0.08)"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={height - margin.bottom + 22}
                  textAnchor="middle"
                  fill="rgb(161 161 170)"
                  fontSize="11"
                >
                  {formatTick(tick)}
                </text>
              </g>
            );
          })}

          {yTicks.map((tick) => {
            const y = scaleY(tick);
            return (
              <g key={`y-${tick}`}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={width - margin.right}
                  y2={y}
                  stroke="rgba(244, 244, 245, 0.08)"
                  strokeWidth="1"
                />
                <text
                  x={margin.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="rgb(161 161 170)"
                  fontSize="11"
                >
                  {formatTick(tick)}
                </text>
              </g>
            );
          })}

          {zeroX !== null ? (
            <line
              x1={zeroX}
              y1={margin.top}
              x2={zeroX}
              y2={height - margin.bottom}
              stroke="rgba(250, 204, 21, 0.35)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
          ) : null}

          {zeroY !== null ? (
            <line
              x1={margin.left}
              y1={zeroY}
              x2={width - margin.right}
              y2={zeroY}
              stroke="rgba(250, 204, 21, 0.35)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
          ) : null}

          <line
            x1={margin.left}
            y1={height - margin.bottom}
            x2={width - margin.right}
            y2={height - margin.bottom}
            stroke="rgb(113 113 122)"
            strokeWidth="1.5"
          />
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={height - margin.bottom}
            stroke="rgb(113 113 122)"
            strokeWidth="1.5"
          />

          {fittedLine ? (
            <g>
              <line
                x1={scaleX(fittedLine.start.x)}
                y1={scaleY(fittedLine.start.y)}
                x2={scaleX(fittedLine.end.x)}
                y2={scaleY(fittedLine.end.y)}
                stroke="rgb(250 204 21)"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.95"
              />
              {fittedLine.label ? (
                <text
                  x={scaleX(fittedLine.end.x) - 8}
                  y={scaleY(fittedLine.end.y) - 10}
                  textAnchor="end"
                  fill="rgb(254 240 138)"
                  fontSize="12"
                >
                  {fittedLine.label}
                </text>
              ) : null}
            </g>
          ) : null}

          {points.map((point, index) => (
            <circle
              key={`${point.x}-${point.y}-${index}`}
              cx={scaleX(point.x)}
              cy={scaleY(point.y)}
              r="5"
              fill={point.className === "classB" ? "rgb(248 113 113)" : "rgb(96 165 250)"}
              fillOpacity="0.88"
              stroke={point.className === "classB" ? "rgb(254 226 226)" : "rgb(239 246 255)"}
              strokeOpacity="0.6"
              strokeWidth="1.5"
            />
          ))}

          <text
            x={width / 2}
            y={height - 14}
            textAnchor="middle"
            fill="rgb(212 212 216)"
            fontSize="12"
          >
            {xLabel}
          </text>

          <text
            x={18}
            y={height / 2}
            textAnchor="middle"
            fill="rgb(212 212 216)"
            fontSize="12"
            transform={`rotate(-90 18 ${height / 2})`}
          >
            {yLabel}
          </text>
        </svg>
      </div>
    </div>
  );
}
