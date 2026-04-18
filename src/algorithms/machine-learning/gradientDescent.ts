import type { ClassifiedPoint, FittedLine } from "./types";

export type GradientDescentModelState = {
  w1: number;
  w2: number;
  bias: number;
  epoch: number;
};

export type GradientDescentMetrics = {
  loss: number;
  accuracy: number;
};

export const GRADIENT_DESCENT_X_DOMAIN: [number, number] = [-6, 6];
export const GRADIENT_DESCENT_Y_DOMAIN: [number, number] = [-24, 24];

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

function createClusterPoint(
  centerX: number,
  centerY: number,
  spread: number,
  className: "default" | "classB",
  label: 0 | 1,
): ClassifiedPoint {
  return {
    x: round(clamp(centerX + randomBetween(-spread, spread), GRADIENT_DESCENT_X_DOMAIN[0], GRADIENT_DESCENT_X_DOMAIN[1])),
    y: round(clamp(centerY + randomBetween(-spread * 1.3, spread * 1.3), GRADIENT_DESCENT_Y_DOMAIN[0], GRADIENT_DESCENT_Y_DOMAIN[1])),
    className,
    label,
  };
}

function createInitialModel(): GradientDescentModelState {
  return {
    w1: randomBetween(-0.25, 0.25),
    w2: randomBetween(-0.25, 0.25),
    bias: randomBetween(-0.25, 0.25),
    epoch: 0,
  };
}

function createDataset(count: number, overlap: number): ClassifiedPoint[] {
  const classACount = Math.ceil(count / 2);
  const classBCount = Math.floor(count / 2);
  const centerAY = randomBetween(-8, 8);
  const centerBY = centerAY + randomBetween(-5, 5);
  const separation = 7.2 * (1 - overlap);
  const centerAX = -separation / 2;
  const centerBX = separation / 2;
  const spread = 0.9 + overlap * 2.4;

  return [
    ...Array.from({ length: classACount }, () =>
      createClusterPoint(centerAX, centerAY, spread, "default", 0),
    ),
    ...Array.from({ length: classBCount }, () =>
      createClusterPoint(centerBX, centerBY, spread, "classB", 1),
    ),
  ];
}

function calculateMetrics(points: ClassifiedPoint[], model: GradientDescentModelState): GradientDescentMetrics {
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

function trainOneEpoch(
  points: ClassifiedPoint[],
  model: GradientDescentModelState,
  learningRate: number,
): GradientDescentModelState {
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

function buildDecisionBoundary(model: GradientDescentModelState): FittedLine {
  const [minX, maxX] = GRADIENT_DESCENT_X_DOMAIN;
  const [minY, maxY] = GRADIENT_DESCENT_Y_DOMAIN;
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

function describeOverlap(overlap: number) {
  if (overlap <= 0.05) return "no overlap";
  if (overlap <= 0.25) return "light overlap";
  if (overlap <= 0.6) return "moderate overlap";
  if (overlap <= 0.9) return "heavy overlap";
  return "complete overlap";
}

export const GradientDescent = {
  xDomain: GRADIENT_DESCENT_X_DOMAIN,
  yDomain: GRADIENT_DESCENT_Y_DOMAIN,
  round,
  createInitialModel,
  createDataset,
  calculateMetrics,
  trainOneEpoch,
  buildDecisionBoundary,
  describeOverlap,
};
