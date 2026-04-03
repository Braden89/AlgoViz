import { useState } from "react";
import { AlgorithmLayout } from "../components/AlgorithmLayout";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { DataPlot2D } from "../components/DataPlot2D";
import { PerceptronDiagram } from "../components/PerceptronDiagram";
import {
  Perceptron,
  type PerceptronModelState,
} from "../algorithms/machine-learning/perceptron";

export default function PerceptronPage() {
  const [pointCount, setPointCount] = useState(24);
  const [overlap, setOverlap] = useState(0.2);
  const [learningRate, setLearningRate] = useState(0.02);
  const [points, setPoints] = useState(() => Perceptron.createDataset(24, 0.2));
  const [model, setModel] = useState<PerceptronModelState>(() => Perceptron.createInitialModel());

  const metrics = Perceptron.calculateMetrics(points, model);
  const boundary = Perceptron.buildDecisionBoundary(model);

  const regenerateDataset = (nextCount = pointCount, nextOverlap = overlap) => {
    setPoints(Perceptron.createDataset(nextCount, nextOverlap));
    setModel(Perceptron.createInitialModel());
  };

  const resetModel = () => {
    setModel(Perceptron.createInitialModel());
  };

  const runEpochs = (epochs: number) => {
    setModel((current) => {
      let next = current;
      for (let index = 0; index < epochs; index += 1) {
        next = Perceptron.trainOneEpoch(points, next, learningRate);
      }
      return next;
    });
  };

  return (
    <AlgorithmLayout
      title="Perceptron"
      headerRight={
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
          <Breadcrumbs
            items={[
              { label: "Home", to: "/" },
              { label: "Machine Learning", to: "/algorithms/machine-learning" },
              { label: "Perceptron" },
            ]}
          />
        </div>
      }
      left={
        <div className="space-y-4">
          <div>
            <div className="text-sm text-zinc-300">Overview</div>
            <div className="mt-2 text-sm text-zinc-400">
              This page shows a single perceptron: one neuron that learns a straight-line decision boundary for two classes. The inputs are zero-centered now, so the learned boundary is easier to interpret instead of being pulled by an all-positive coordinate system.
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
            <div className="text-sm text-zinc-300">Current Model</div>
            <div className="mt-2 grid gap-2 text-sm text-zinc-400">
              <div>w1 = {Perceptron.round(model.w1)}</div>
              <div>w2 = {Perceptron.round(model.w2)}</div>
              <div>bias = {Perceptron.round(model.bias)}</div>
              <div>epoch = {model.epoch}</div>
            </div>
          </div>

          <PerceptronDiagram w1={model.w1} w2={model.w2} bias={model.bias} />

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
            <div className="text-sm text-zinc-300">What It Learns</div>
            <div className="mt-2 text-sm text-zinc-400">
              The perceptron predicts one class on one side of the line and the other class on the opposite side. When it makes a mistake, it nudges the weights and bias to move the boundary. Centering the features around zero makes that boundary look more balanced.
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
            <div className="text-sm text-zinc-300">Why It Matters</div>
            <div className="mt-2 text-sm text-zinc-400">
              A perceptron is the basic building block for later neural-network visualizations. Once this single unit makes sense, stacking multiple units into layers becomes much easier to explain.
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
                <div className="text-[11px] uppercase tracking-wide text-zinc-500">Accuracy</div>
                <div className="mt-1 text-lg text-zinc-100">{Math.round(metrics.accuracy * 100)}%</div>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                <div className="text-[11px] uppercase tracking-wide text-zinc-500">Mistakes</div>
                <div className="mt-1 text-lg text-zinc-100">{metrics.mistakes}</div>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                <div className="text-[11px] uppercase tracking-wide text-zinc-500">Epoch</div>
                <div className="mt-1 text-lg text-zinc-100">{model.epoch}</div>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                <div className="text-[11px] uppercase tracking-wide text-zinc-500">Overlap</div>
                <div className="mt-1 text-lg text-zinc-100">{Perceptron.describeOverlap(overlap)}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4 text-sm text-zinc-400">
            The perceptron works best when the classes are linearly separable. As overlap increases, the line has a harder time finding a clean split, which is exactly why later multi-layer networks become useful.
            With zero-centered inputs, the weights and bias are also easier to reason about.
          </div>
        </div>
      }
      bottom={
        <DataPlot2D
          title="Single Perceptron Classification View"
          xLabel="Feature x1"
          yLabel="Feature x2"
          points={points}
          xDomain={Perceptron.xDomain}
          yDomain={Perceptron.yDomain}
          fittedLine={boundary}
        />
      }
    />
  );
}
