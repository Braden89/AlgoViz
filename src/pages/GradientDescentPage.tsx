import { useState } from "react";
import { AlgorithmLayout } from "../components/AlgorithmLayout";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { DataPlot2D } from "../components/DataPlot2D";
import {
  GradientDescent,
  type GradientDescentModelState,
} from "../algorithms/machine-learning/gradientDescent";

export default function GradientDescentPage() {
  const [pointCount, setPointCount] = useState(24);
  const [overlap, setOverlap] = useState(0.25);
  const [learningRate, setLearningRate] = useState(0.02);
  const [points, setPoints] = useState(() => GradientDescent.createDataset(24, 0.25));
  const [model, setModel] = useState<GradientDescentModelState>(() => GradientDescent.createInitialModel());

  const metrics = GradientDescent.calculateMetrics(points, model);
  const boundary = GradientDescent.buildDecisionBoundary(model);

  const regenerateDataset = (nextCount = pointCount, nextOverlap = overlap) => {
    setPoints(GradientDescent.createDataset(nextCount, nextOverlap));
    setModel(GradientDescent.createInitialModel());
  };

  const resetModel = () => {
    setModel(GradientDescent.createInitialModel());
  };

  const runEpochs = (epochs: number) => {
    setModel((current) => {
      let next = current;
      for (let index = 0; index < epochs; index += 1) {
        next = GradientDescent.trainOneEpoch(points, next, learningRate);
      }
      return next;
    });
  };

  return (
    <AlgorithmLayout
      title="Gradient Descent"
      headerRight={
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
          <Breadcrumbs
            items={[
              { label: "Home", to: "/" },
              { label: "Machine Learning", to: "/algorithms/machine-learning" },
              { label: "Gradient Descent" },
            ]}
          />
        </div>
      }
      left={
        <div className="space-y-4">
          <div>
            <div className="text-sm text-zinc-300">Overview</div>
            <div className="mt-2 text-sm text-zinc-400">
              This page uses gradient descent to train a simple linear classifier on two colored classes. As training runs, the decision boundary shifts to reduce classification loss.
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
            <div className="text-sm text-zinc-300">Dataset</div>
            <div className="mt-2 text-sm text-zinc-400">
              Blue points are Class A and red points are Class B. The overlap slider controls how mixed the classes are, from easy separation to almost impossible separation.
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
            <div className="text-sm text-zinc-300">Current Model</div>
            <div className="mt-2 grid gap-2 text-sm text-zinc-400">
              <div>w1 = {GradientDescent.round(model.w1)}</div>
              <div>w2 = {GradientDescent.round(model.w2)}</div>
              <div>bias = {GradientDescent.round(model.bias)}</div>
              <div>epoch = {model.epoch}</div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
            <div className="text-sm text-zinc-300">Decision Boundary</div>
            <div className="mt-2 text-sm text-zinc-400">
              The yellow line marks where the classifier is equally unsure between the two classes.
            </div>
          </div>
        </div>
      }
      right={
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
            <div className="text-sm text-zinc-300">Controls</div>
            <div className="mt-4 grid gap-4">
              <label className="space-y-2 text-xs text-zinc-400">
                <span>Point count: {pointCount}</span>
                <input
                  className="w-full"
                  type="range"
                  min={12}
                  max={48}
                  step={2}
                  value={pointCount}
                  onChange={(event) => {
                    const nextCount = Number(event.target.value);
                    setPointCount(nextCount);
                    regenerateDataset(nextCount, overlap);
                  }}
                />
              </label>

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
                    regenerateDataset(pointCount, nextOverlap);
                  }}
                />
              </label>

              <label className="space-y-2 text-xs text-zinc-400">
                <span>Learning rate: {learningRate.toFixed(2)}</span>
                <input
                  className="w-full"
                  type="range"
                  min={0.01}
                  max={0.3}
                  step={0.01}
                  value={learningRate}
                  onChange={(event) => setLearningRate(Number(event.target.value))}
                />
              </label>

              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-900"
                  onClick={() => runEpochs(1)}
                >
                  Train 1 Epoch
                </button>
                <button
                  className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-900"
                  onClick={() => runEpochs(10)}
                >
                  Train 10 Epochs
                </button>
                <button
                  className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-900"
                  onClick={resetModel}
                >
                  Reset Model
                </button>
                <button
                  className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-900"
                  onClick={() => regenerateDataset()}
                >
                  Regenerate Data
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
            <div className="text-sm text-zinc-300">Training Metrics</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                <div className="text-[11px] uppercase tracking-wide text-zinc-500">Loss</div>
                <div className="mt-1 text-lg text-zinc-100">{GradientDescent.round(metrics.loss)}</div>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                <div className="text-[11px] uppercase tracking-wide text-zinc-500">Accuracy</div>
                <div className="mt-1 text-lg text-zinc-100">{Math.round(metrics.accuracy * 100)}%</div>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                <div className="text-[11px] uppercase tracking-wide text-zinc-500">Epoch</div>
                <div className="mt-1 text-lg text-zinc-100">{model.epoch}</div>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                <div className="text-[11px] uppercase tracking-wide text-zinc-500">Overlap</div>
                <div className="mt-1 text-lg text-zinc-100">{GradientDescent.describeOverlap(overlap)}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4 text-sm text-zinc-400">
            Lower overlap usually means lower loss and faster improvement. When overlap gets close to 100%, the classes become hard to separate with a straight boundary.
          </div>
        </div>
      }
      bottom={
        <DataPlot2D
          title="Two-Class Training Data"
          xLabel="Feature x1"
          yLabel="Feature x2"
          points={points}
          xDomain={GradientDescent.xDomain}
          yDomain={GradientDescent.yDomain}
          fittedLine={boundary}
        />
      }
    />
  );
}
