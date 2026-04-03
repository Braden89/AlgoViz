import { useState } from "react";
import { AlgorithmLayout } from "../components/AlgorithmLayout";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { DataPlot2D } from "../components/DataPlot2D";
import {
  LinearRegression,
  type LinearRegressionDataMode,
} from "../algorithms/machine-learning/linearRegression";

export default function LinearRegressionPage() {
  const [mode, setMode] = useState<LinearRegressionDataMode>("linear");
  const [pointCount, setPointCount] = useState(18);
  const [overlap, setOverlap] = useState(0.2);
  const [dataset, setDataset] = useState(() => LinearRegression.createDataset("linear", 18, 0.2));

  const isClusterMode = mode === "two-class-clusters";
  const regression = LinearRegression.calculateRegression(dataset.points);
  const equation = `y = ${LinearRegression.round(regression.slope)}x + ${LinearRegression.round(regression.intercept)}`;

  const regenerate = (
    nextMode = mode,
    nextCount = pointCount,
    nextOverlap = overlap,
  ) => {
    setDataset(LinearRegression.createDataset(nextMode, nextCount, nextOverlap));
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
                    const nextMode = event.target.value as LinearRegressionDataMode;
                    setMode(nextMode);
                    setDataset(LinearRegression.createDataset(nextMode, pointCount, overlap));
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
                    setDataset(LinearRegression.createDataset(mode, nextCount, overlap));
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
                      setDataset(LinearRegression.createDataset(mode, pointCount, nextOverlap));
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
                  <div className="mt-1 text-lg text-zinc-100">{LinearRegression.round(regression.slope)}</div>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500">Intercept</div>
                  <div className="mt-1 text-lg text-zinc-100">{LinearRegression.round(regression.intercept)}</div>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500">MSE</div>
                  <div className="mt-1 text-lg text-zinc-100">{LinearRegression.round(regression.mse)}</div>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500">R^2</div>
                  <div className="mt-1 text-lg text-zinc-100">{LinearRegression.round(regression.rSquared)}</div>
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
            {LinearRegression.describeFit(mode, regression.rSquared)}
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
