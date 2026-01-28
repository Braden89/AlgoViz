export type Metrics = {
  comparisons: number;
  swaps: number;
};

export type StepMeta = Record<string, unknown> | undefined;

export type Step<M extends StepMeta = undefined> = {
  array: number[];
  line: number;
  active?: number[];
  metrics: Metrics;
  note?: string;
  swap?: [number, number];

  // algorithm-specific extras live here
  meta?: M;
};

export type AlgorithmDefinition<M extends StepMeta = undefined> = {
  id: string;
  name: string;
  category: "sorting" | "graphs" | "trees" | "dp";
  pseudocode: string[];
  generateSteps: (input: number[]) => Step<M>[];
};
