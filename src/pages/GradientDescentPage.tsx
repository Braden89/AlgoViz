import { useState } from "react";
import { AlgorithmLayout } from "../components/AlgorithmLayout";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { DataPlot2D } from "../components/DataPlot2D";

type ClassPoint = {
  x: number;
  y: number;
  className: "default" | "classB";
  label: 0 | 1;
};

type ModelState = {
  w1: number;
  w2: number;
  bias: number;
  epoch: number;
};

const X_DOMAIN: [number, number] = [0, 12];
const Y_DOMAIN: [number, number] = [0, 48];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function sigmoid(value: number) {
  return 1 / (1 + Math.exp(-value));
}

function createInitialModel(): ModelState {
  return {
    w1: randomBetween(-0.25, 0.25),
    w2: randomBetween(-0.25, 0.25),
    bias: randomBetween(-0.25, 0.25),
    epoch: 0,
  };
}

function createTwoClassClusters(count: number, overlap: number): ClassPoint[] {
  const classACount = Math.ceil(count / 2);
  const classBCount = Math.floor(count / 2);
  const centerAY = randomBetween(16, 31);
  const centerBY = centerAY + randomBetween(-5, 5);
  const separation = 7.2 * (1 - overlap);
  const centerAX = 6 - separation / 2;
  const centerBX = 6 + separation / 2;
  const spread = 0.9 + overlap * 2.4;

  const makePoint = (
    centerX: number,
    centerY: number,
    className: "default" | "classB",
    label: 0 | 1,
  ): ClassPoint => ({
    x: round(clamp(centerX + randomBetween(-spread, spread), 0, 12)),
    y: round(clamp(centerY + randomBetween(-spread * 1.3, spread * 1.3), 0, 48)),
    className,
    label,
  });

  return [
    ...Array.from({ length: classACount }, () => makePoint(centerAX, centerAY, "default", 0)),
    ...Array.from({ length: classBCount }, () => makePoint(centerBX, centerBY, "classB", 1)),
  ];
}

function calculateMetrics(points: ClassPoint[], model: ModelState) {
  let totalLoss = 0;
  let correct = 0;

  for (const point of points) {
    const z = model.w1 * point.x + model.w2 * point.y + model.bias;
    const prediction = sigmoid(z);
    const clippedPrediction = clamp(prediction, 1e-7, 1 - 1e-7);
    totalLoss +=
      -point.label * Math.log(clippedPrediction) -
      (1 - point.label) * Math.log(1 - clippedPrediction);

    const predictedLabel = prediction >= 0.5 ? 1 : 0;
    if (predictedLabel === point.label) correct += 1;
  }

  return {
    loss: totalLoss / points.length,
    accuracy: correct / points.length,
  };
}

function trainOneEpoch(points: ClassPoint[], model: ModelState, learningRate: number): ModelState {
  let gradW1 = 0;
  let gradW2 = 0;
  let gradBias = 0;

  for (const point of points) {
    const z = model.w1 * point.x + model.w2 * point.y + model.bias;
    const prediction = sigmoid(z);
    const error = prediction - point.label;
    gradW1 += error * point.x;
    gradW2 += error * point.y;
    gradBias += error;
  }

  const scale = 1 / points.length;

  return {
    w1: model.w1 - learningRate * gradW1 * scale,
    w2: model.w2 - learningRate * gradW2 * scale,
    bias: model.bias - learningRate * gradBias * scale,
    epoch: model.epoch + 1,
  };
}

function buildDecisionBoundary(model: ModelState) {
  const [minX, maxX] = X_DOMAIN;
  const [minY, maxY] = Y_DOMAIN;
  const candidates: Array<{ x: number; y: number }> = [];

  if (Math.abs(model.w2) > 0.0001) {
    const yAtMinX = -(model.w1 * minX + model.bias) / model.w2;
    const yAtMaxX = -(model.w1 * maxX + model.bias) / model.w2;

    if (yAtMinX >= minY && yAtMinX <= maxY) candidates.push({ x: minX, y: yAtMinX });
    if (yAtMaxX >= minY && yAtMaxX <= maxY) candidates.push({ x: maxX, y: yAtMaxX });
  }

  if (Math.abs(model.w1) > 0.0001) {
    const xAtMinY = -(model.w2 * minY + model.bias) / model.w1;
    const xAtMaxY = -(model.w2 * maxY + model.bias) / model.w1;

    if (xAtMinY >= minX && xAtMinY <= maxX) candidates.push({ x: xAtMinY, y: minY });
    if (xAtMaxY >= minX && xAtMaxY <= maxX) candidates.push({ x: xAtMaxY, y: maxY });
  }

  const uniqueCandidates = candidates.filter(
    (candidate, index) =>
      candidates.findIndex(
        (other) =>
          Math.abs(other.x - candidate.x) < 0.001 &&
          Math.abs(other.y - candidate.y) < 0.001,
      ) === index,
  );

  if (uniqueCandidates.length >= 2) {
    return {
      start: uniqueCandidates[0],
      end: uniqueCandidates[1],
      label: "Decision boundary",
    };
  }

  if (Math.abs(model.w2) <= 0.0001 && Math.abs(model.w1) > 0.0001) {
    const x = clamp(-model.bias / model.w1, minX, maxX);
    return {
      start: { x, y: minY },
      end: { x, y: maxY },
      label: "Decision boundary",
    };
  }

  if (Math.abs(model.w1) <= 0.0001 && Math.abs(model.w2) > 0.0001) {
    const y = clamp(-model.bias / model.w2, minY, maxY);
    return {
      start: { x: minX, y },
      end: { x: maxX, y },
      label: "Decision boundary",
    };
  }

  return {
    start: { x: minX, y: (minY + maxY) / 2 },
    end: { x: maxX, y: (minY + maxY) / 2 },
    label: "Decision boundary",
  };
}

function overlapDescription(overlap: number) {
  if (overlap <= 0.05) return "no overlap";
  if (overlap <= 0.25) return "light overlap";
  if (overlap <= 0.6) return "moderate overlap";
  if (overlap <= 0.9) return "heavy overlap";
  return "complete overlap";
}

export default function GradientDescentPage() {
  const [pointCount, setPointCount] = useState(24);
  const [overlap, setOverlap] = useState(0.25);
  const [learningRate, setLearningRate] = useState(0.08);
  const [points, setPoints] = useState(() => createTwoClassClusters(24, 0.25));
  const [model, setModel] = useState<ModelState>(() => createInitialModel());

  const metrics = calculateMetrics(points, model);
  const boundary = buildDecisionBoundary(model);

  const regenerateDataset = (nextCount = pointCount, nextOverlap = overlap) => {
    setPoints(createTwoClassClusters(nextCount, nextOverlap));
    setModel(createInitialModel());
  };

  const resetModel = () => {
    setModel(createInitialModel());
  };

  const runEpochs = (epochs: number) => {
    setModel((current) => {
      let next = current;
      for (let index = 0; index < epochs; index += 1) {
        next = trainOneEpoch(points, next, learningRate);
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
              <div>w1 = {round(model.w1)}</div>
              <div>w2 = {round(model.w2)}</div>
              <div>bias = {round(model.bias)}</div>
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
                <div className="mt-1 text-lg text-zinc-100">{round(metrics.loss)}</div>
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
                <div className="mt-1 text-lg text-zinc-100">{overlapDescription(overlap)}</div>
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
          xDomain={X_DOMAIN}
          yDomain={Y_DOMAIN}
          fittedLine={boundary}
        />
      }
    />
  );
}
