import type { ClassifiedPoint, FittedLine } from "./types";

export type PerceptronModelState = {
  w1: number;
  w2: number;
  bias: number;
  epoch: number;
};

export type PerceptronMetrics = {
  accuracy: number;
  mistakes: number;
};

export const PERCEPTRON_X_DOMAIN: [number, number] = [0, 12];
export const PERCEPTRON_Y_DOMAIN: [number, number] = [0, 48];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createClusterPoint(
  centerX: number,
  centerY: number,
  spread: number,
  className: "default" | "classB",
  label: 0 | 1,
): ClassifiedPoint {
  return {
    x: round(
      clamp(
        centerX + randomBetween(-spread, spread),
        PERCEPTRON_X_DOMAIN[0],
        PERCEPTRON_X_DOMAIN[1],
      ),
    ),
    y: round(
      clamp(
        centerY + randomBetween(-spread * 1.3, spread * 1.3),
        PERCEPTRON_Y_DOMAIN[0],
        PERCEPTRON_Y_DOMAIN[1],
      ),
    ),
    className,
    label,
  };
}

function createDataset(count: number, overlap: number): ClassifiedPoint[] {
  const classACount = Math.ceil(count / 2);
  const classBCount = Math.floor(count / 2);
  const centerAY = randomBetween(16, 31);
  const centerBY = centerAY + randomBetween(-5, 5);
  const separation = 7.2 * (1 - overlap);
  const centerAX = 6 - separation / 2;
  const centerBX = 6 + separation / 2;
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

function createInitialModel(): PerceptronModelState {
  return {
    w1: randomBetween(-0.25, 0.25),
    w2: randomBetween(-0.25, 0.25),
    bias: randomBetween(-0.25, 0.25),
    epoch: 0,
  };
}

function predictRaw(model: PerceptronModelState, point: ClassifiedPoint) {
  return model.w1 * point.x + model.w2 * point.y + model.bias;
}

function predictLabel(model: PerceptronModelState, point: ClassifiedPoint) {
  return predictRaw(model, point) >= 0 ? 1 : 0;
}

function calculateMetrics(
  points: ClassifiedPoint[],
  model: PerceptronModelState,
): PerceptronMetrics {
  let correct = 0;

  for (const point of points) {
    if (predictLabel(model, point) === point.label) correct += 1;
  }

  return {
    accuracy: correct / points.length,
    mistakes: points.length - correct,
  };
}

function trainOneEpoch(
  points: ClassifiedPoint[],
  model: PerceptronModelState,
  learningRate: number,
): PerceptronModelState {
  let next = { ...model };

  for (const point of points) {
    const prediction = predictLabel(next, point);
    const error = point.label - prediction;
    if (error === 0) continue;

    next = {
      ...next,
      w1: next.w1 + learningRate * error * point.x,
      w2: next.w2 + learningRate * error * point.y,
      bias: next.bias + learningRate * error,
    };
  }

  return {
    ...next,
    epoch: model.epoch + 1,
  };
}

function buildDecisionBoundary(model: PerceptronModelState): FittedLine {
  const [minX, maxX] = PERCEPTRON_X_DOMAIN;
  const [minY, maxY] = PERCEPTRON_Y_DOMAIN;
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
      label: "Perceptron boundary",
    };
  }

  if (Math.abs(model.w2) <= 0.0001 && Math.abs(model.w1) > 0.0001) {
    const x = clamp(-model.bias / model.w1, minX, maxX);
    return {
      start: { x, y: minY },
      end: { x, y: maxY },
      label: "Perceptron boundary",
    };
  }

  if (Math.abs(model.w1) <= 0.0001 && Math.abs(model.w2) > 0.0001) {
    const y = clamp(-model.bias / model.w2, minY, maxY);
    return {
      start: { x: minX, y },
      end: { x: maxX, y },
      label: "Perceptron boundary",
    };
  }

  return {
    start: { x: minX, y: (minY + maxY) / 2 },
    end: { x: maxX, y: (minY + maxY) / 2 },
    label: "Perceptron boundary",
  };
}

function describeOverlap(overlap: number) {
  if (overlap <= 0.05) return "no overlap";
  if (overlap <= 0.25) return "light overlap";
  if (overlap <= 0.6) return "moderate overlap";
  if (overlap <= 0.9) return "heavy overlap";
  return "complete overlap";
}

export const Perceptron = {
  xDomain: PERCEPTRON_X_DOMAIN,
  yDomain: PERCEPTRON_Y_DOMAIN,
  round,
  createDataset,
  createInitialModel,
  calculateMetrics,
  trainOneEpoch,
  buildDecisionBoundary,
  describeOverlap,
};
