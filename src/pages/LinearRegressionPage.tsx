import { useState } from "react";
import { AlgorithmLayout } from "../components/AlgorithmLayout";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { DataPlot2D } from "../components/DataPlot2D";

type DataMode = "linear" | "exponential" | "logarithmic" | "two-class-clusters";

type PlotPoint = {
  x: number;
  y: number;
  className?: "default" | "classB";
};

type Dataset = {
  points: PlotPoint[];
  summary: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createLinearPoints(count: number): Dataset {
  const slope = randomBetween(1.1, 2.8);
  const intercept = randomBetween(2, 10);
  const noise = randomBetween(1.2, 4.4);

  const points: PlotPoint[] = Array.from({ length: count }, (_, index) => {
    const x = index * (12 / Math.max(count - 1, 1));
    const y = intercept + slope * x + randomBetween(-noise, noise);
    return { x: round(x), y: round(clamp(y, 0, 48)) };
  });

  return {
    points,
    summary: `Generated from y = ${round(slope)}x + ${round(intercept)} with +/- ${round(noise)} noise.`,
  };
}

function createExponentialPoints(count: number): Dataset {
  const scale = randomBetween(1.8, 4.5);
  const growth = randomBetween(0.18, 0.34);
  const noise = randomBetween(0.4, 2.2);

  const points: PlotPoint[] = Array.from({ length: count }, (_, index) => {
    const x = index * (10 / Math.max(count - 1, 1));
    const y = scale * Math.exp(growth * x) + randomBetween(-noise, noise);
    return { x: round(x), y: round(clamp(y, 0, 48)) };
  });

  return {
    points,
    summary: `Generated from y = ${round(scale)}e^(${round(growth)}x) with +/- ${round(noise)} noise.`,
  };
}

function createLogarithmicPoints(count: number): Dataset {
  const scale = randomBetween(7, 14);
  const shift = randomBetween(0.7, 1.8);
  const intercept = randomBetween(2, 8);
  const noise = randomBetween(0.5, 1.8);

  const points: PlotPoint[] = Array.from({ length: count }, (_, index) => {
    const x = 0.4 + index * (11.6 / Math.max(count - 1, 1));
    const y = intercept + scale * Math.log(x + shift) + randomBetween(-noise, noise);
    return { x: round(x), y: round(clamp(y, 0, 48)) };
  });

  return {
    points,
    summary: `Generated from y = ${round(intercept)} + ${round(scale)}ln(x + ${round(shift)}) with +/- ${round(noise)} noise.`,
  };
}

function createTwoClassClusters(count: number, overlap: number): Dataset {
  const classACount = Math.ceil(count / 2);
  const classBCount = Math.floor(count / 2);
  const classAY = randomBetween(15, 32);
  const classBY = classAY + randomBetween(-4, 4);
  const baseSeparation = 7.5 * (1 - overlap);
  const centerAX = 6 - baseSeparation / 2;
  const centerBX = 6 + baseSeparation / 2;
  const spread = 0.9 + overlap * 2.2;

  const makePoint = (
    centerX: number,
    centerY: number,
    className: "default" | "classB",
  ): PlotPoint => ({
    x: round(clamp(centerX + randomBetween(-spread, spread), 0, 12)),
    y: round(clamp(centerY + randomBetween(-spread * 1.35, spread * 1.35), 0, 48)),
    className,
  });

  const classAPoints = Array.from({ length: classACount }, () =>
    makePoint(centerAX, classAY, "default"),
  );
  const classBPoints = Array.from({ length: classBCount }, () =>
    makePoint(centerBX, classBY, "classB"),
  );

  const overlapLabel =
    overlap < 0.2
      ? "almost no overlap"
      : overlap < 0.45
        ? "light overlap"
        : overlap < 0.75
          ? "moderate overlap"
          : overlap < 0.95
            ? "heavy overlap"
            : "complete overlap";

  return {
    points: [...classAPoints, ...classBPoints],
    summary: `Generated two class clusters with ${overlapLabel}. Class A is blue and Class B is red.`,
  };
}

function createDataset(mode: DataMode, count: number, overlap: number): Dataset {
  if (mode === "linear") return createLinearPoints(count);
  if (mode === "logarithmic") return createLogarithmicPoints(count);
  if (mode === "two-class-clusters") return createTwoClassClusters(count, overlap);
  return createExponentialPoints(count);
}

function mean(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function calculateLinearRegression(points: PlotPoint[]) {
  const xMean = mean(points.map((point) => point.x));
  const yMean = mean(points.map((point) => point.y));

  let numerator = 0;
  let denominator = 0;

  for (const point of points) {
    numerator += (point.x - xMean) * (point.y - yMean);
    denominator += (point.x - xMean) ** 2;
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = yMean - slope * xMean;

  const predicted = points.map((point) => slope * point.x + intercept);
  const residuals = points.map((point, index) => point.y - predicted[index]);
  const sse = residuals.reduce((sum, residual) => sum + residual ** 2, 0);
  const mse = sse / points.length;
  const totalVariance = points.reduce((sum, point) => sum + (point.y - yMean) ** 2, 0);
  const rSquared = totalVariance === 0 ? 1 : 1 - sse / totalVariance;

  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));

  return {
    slope,
    intercept,
    mse,
    rSquared,
    line: {
      start: { x: minX, y: slope * minX + intercept },
      end: { x: maxX, y: slope * maxX + intercept },
      label: "Best-fit line",
    },
  };
}

function describeFit(mode: DataMode, rSquared: number) {
  if (mode === "linear") {
    return rSquared > 0.9
      ? "The best-fit line tracks the data closely, which is what we want for linear regression."
      : "This sample has more noise, so the line still helps but the fit is less precise.";
  }

  if (mode === "two-class-clusters") {
    return "This clustered view is a better setup for later showing classification-style gradient descent, because the two groups can move from clearly separated to fully mixed.";
  }

  return rSquared > 0.9
    ? "This random sample still looks fairly linear over this range, so the fitted line appears stronger than usual."
    : "The line is trying to approximate a curved relationship, so the fit is weaker and the mismatch is easier to see.";
}

export default function LinearRegressionPage() {
  const [mode, setMode] = useState<DataMode>("linear");
  const [pointCount, setPointCount] = useState(18);
  const [overlap, setOverlap] = useState(0.2);
  const [dataset, setDataset] = useState(() => createDataset("linear", 18, 0.2));

  const isClusterMode = mode === "two-class-clusters";
  const regression = calculateLinearRegression(dataset.points);
  const equation = `y = ${round(regression.slope)}x + ${round(regression.intercept)}`;

  const regenerate = (
    nextMode = mode,
    nextCount = pointCount,
    nextOverlap = overlap,
  ) => {
    setDataset(createDataset(nextMode, nextCount, nextOverlap));
  };

  return (
    <AlgorithmLayout
      title="Linear Regression"
      headerRight={
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
          <Breadcrumbs
            items={[
              { label: "Home", to: "/" },
              { label: "Machine Learning", to: "/algorithms/machine-learning" },
              { label: "Linear Regression" },
            ]}
          />
        </div>
      }
      left={
        <div className="space-y-4">
          <div>
            <div className="text-sm text-zinc-300">Overview</div>
            <div className="mt-2 text-sm text-zinc-400">
              This view now supports both regression-style datasets and a two-class clustered dataset so we can start preparing the graph for future gradient descent visualizations.
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
            <div className="text-sm text-zinc-300">Current Dataset</div>
            <div className="mt-2 text-sm text-zinc-400">{dataset.summary}</div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
            <div className="text-sm text-zinc-300">Why This Matters</div>
            <div className="mt-2 text-sm text-zinc-400">
              The regression modes help us fit a line, while the clustered mode gives us two colored groups that can move from separated to fully overlapped. That clustered setup is a strong starting point for later classification and gradient descent demos.
            </div>
          </div>

          {!isClusterMode ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
              <div className="text-sm text-zinc-300">Regression Line</div>
              <div className="mt-2 text-sm text-zinc-400">{equation}</div>
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
              <div className="text-sm text-zinc-300">Class Groups</div>
              <div className="mt-2 text-sm text-zinc-400">
                Blue points represent Class A and red points represent Class B.
              </div>
            </div>
          )}
        </div>
      }
      right={
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
            <div className="text-sm text-zinc-300">Controls</div>

            <div className="mt-4 grid gap-4">
              <label className="space-y-2 text-xs text-zinc-400">
                <span>Pattern</span>
                <select
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100"
                  value={mode}
                  onChange={(event) => {
                    const nextMode = event.target.value as DataMode;
                    setMode(nextMode);
                    setDataset(createDataset(nextMode, pointCount, overlap));
                  }}
                >
                  <option value="linear">Linear line</option>
                  <option value="exponential">Exponential curve</option>
                  <option value="logarithmic">Logarithmic curve</option>
                  <option value="two-class-clusters">Two-class clusters</option>
                </select>
              </label>

              <label className="space-y-2 text-xs text-zinc-400">
                <span>Point count: {pointCount}</span>
                <input
                  className="w-full"
                  type="range"
                  min={8}
                  max={36}
                  step={1}
                  value={pointCount}
                  onChange={(event) => {
                    const nextCount = Number(event.target.value);
                    setPointCount(nextCount);
                    setDataset(createDataset(mode, nextCount, overlap));
                  }}
                />
              </label>

              {isClusterMode ? (
                <label className="space-y-2 text-xs text-zinc-400">
                  <span>Class overlap: {Math.round(overlap * 100)}%</span>
                  <input
                    className="w-full"
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={overlap}
                    onChange={(event) => {
                      const nextOverlap = Number(event.target.value);
                      setOverlap(nextOverlap);
                      setDataset(createDataset(mode, pointCount, nextOverlap));
                    }}
                  />
                </label>
              ) : null}

              <button
                className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-900"
                onClick={() => regenerate()}
              >
                Regenerate Random Data
              </button>
            </div>
          </div>

          {!isClusterMode ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
              <div className="text-sm text-zinc-300">Fit Metrics</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500">Slope</div>
                  <div className="mt-1 text-lg text-zinc-100">{round(regression.slope)}</div>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500">Intercept</div>
                  <div className="mt-1 text-lg text-zinc-100">{round(regression.intercept)}</div>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500">MSE</div>
                  <div className="mt-1 text-lg text-zinc-100">{round(regression.mse)}</div>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500">R^2</div>
                  <div className="mt-1 text-lg text-zinc-100">{round(regression.rSquared)}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
              <div className="text-sm text-zinc-300">Cluster Controls</div>
              <div className="mt-2 text-sm text-zinc-400">
                Slide overlap toward 0% to separate the classes, or toward 100% to stack both classes into nearly the same region.
              </div>
            </div>
          )}

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4 text-sm text-zinc-400">
            {describeFit(mode, regression.rSquared)}
          </div>
        </div>
      }
      bottom={
        <DataPlot2D
          title={
            mode === "linear"
              ? "Linear Sample Data"
              : mode === "exponential"
                ? "Exponential Sample Data"
                : mode === "logarithmic"
                  ? "Logarithmic Sample Data"
                  : "Two-Class Cluster Data"
          }
          xLabel="Feature (x)"
          yLabel="Target (y)"
          points={dataset.points}
          fittedLine={isClusterMode ? undefined : regression.line}
        />
      }
    />
  );
}
