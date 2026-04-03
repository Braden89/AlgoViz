import type { FittedLine, PlotClassName, PlotPoint } from "./types";

export type LinearRegressionDataMode =
  | "linear"
  | "exponential"
  | "logarithmic"
  | "two-class-clusters";

export type LinearRegressionDataset = {
  points: PlotPoint[];
  summary: string;
};

export type LinearRegressionResult = {
  slope: number;
  intercept: number;
  mse: number;
  rSquared: number;
  line: FittedLine;
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

function mean(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function createClusterPoint(
  centerX: number,
  centerY: number,
  spread: number,
  className: PlotClassName,
): PlotPoint {
  return {
    x: round(clamp(centerX + randomBetween(-spread, spread), 0, 12)),
    y: round(clamp(centerY + randomBetween(-spread * 1.35, spread * 1.35), 0, 48)),
    className,
  };
}

function createLinearPoints(count: number): LinearRegressionDataset {
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

function createExponentialPoints(count: number): LinearRegressionDataset {
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

function createLogarithmicPoints(count: number): LinearRegressionDataset {
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

function createTwoClassClusters(count: number, overlap: number): LinearRegressionDataset {
  const classACount = Math.ceil(count / 2);
  const classBCount = Math.floor(count / 2);
  const classAY = randomBetween(15, 32);
  const classBY = classAY + randomBetween(-4, 4);
  const baseSeparation = 7.5 * (1 - overlap);
  const centerAX = 6 - baseSeparation / 2;
  const centerBX = 6 + baseSeparation / 2;
  const spread = 0.9 + overlap * 2.2;

  const points = [
    ...Array.from({ length: classACount }, () =>
      createClusterPoint(centerAX, classAY, spread, "default"),
    ),
    ...Array.from({ length: classBCount }, () =>
      createClusterPoint(centerBX, classBY, spread, "classB"),
    ),
  ];

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
    points,
    summary: `Generated two class clusters with ${overlapLabel}. Class A is blue and Class B is red.`,
  };
}

function createDataset(mode: LinearRegressionDataMode, count: number, overlap: number) {
  if (mode === "linear") return createLinearPoints(count);
  if (mode === "logarithmic") return createLogarithmicPoints(count);
  if (mode === "two-class-clusters") return createTwoClassClusters(count, overlap);
  return createExponentialPoints(count);
}

function calculateRegression(points: PlotPoint[]): LinearRegressionResult {
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

function describeFit(mode: LinearRegressionDataMode, rSquared: number) {
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

export const LinearRegression = {
  createDataset,
  calculateRegression,
  describeFit,
  round,
};
