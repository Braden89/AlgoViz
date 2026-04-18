# AlgoVis - Adding Any Algorithm

This guide replaces the old sorting-only checklist. Use it when adding:

- a new algorithm inside an existing category
- a new visualization style for an algorithm
- a brand-new category on the home screen

The current project has two main integration patterns, and the right one depends on the kind of visualization you are building.

## 1. Choose the Right Pattern First

### Pattern A: Step-by-step playback

Use this for algorithms that animate through discrete states with:

- `PlayerControls`
- `PseudocodePanel`
- metrics that change over time
- a current step stored in `usePlayerStore`

Examples:

- sorting: `src/algorithms/sorting`
- tree sort: `src/algorithms/trees/treeSort.ts`
- graph search: `src/algorithms/search`
- networking simulations like Paxos and RDT

### Pattern B: Interactive playground / computed view

Use this for algorithms that are better shown as a live sandbox instead of a prerecorded step list.

Examples:

- `src/pages/LinearRegressionPage.tsx`
- `src/pages/GradientDescentPage.tsx`
- `src/pages/KNearestNeighborsPage.tsx`
- `src/pages/PerceptronPage.tsx`

These pages usually keep their own local React state and render custom components such as `DataPlot2D`, instead of using the player store.

## 2. Pick the File Locations

Add the core logic in the category folder that matches the feature:

```txt
src/algorithms/sorting/<algorithmName>.ts
src/algorithms/search/<algorithmName>.ts
src/algorithms/networking/<algorithmName>.ts
src/algorithms/machine-learning/<algorithmName>.ts
src/algorithms/trees/<algorithmName>.ts
```

Add the page here:

```txt
src/pages/<AlgorithmName>Page.tsx
```

If the visualization needs a new renderer, add it under:

```txt
src/components/
```

## 3. If You Are Building a Step-Based Algorithm

### Recommended shape

For array-based algorithms, use the shared types from `src/algorithms/types.ts`:

```ts
import type { AlgorithmDefinition, Step } from "../types";
```

The shared step shape is:

```ts
type Step<M = undefined> = {
  array: number[];
  line: number;
  active?: number[];
  metrics: {
    comparisons: number;
    swaps: number;
  };
  note?: string;
  swap?: [number, number];
  meta?: M;
  inspector?: StepInspectorItem[];
};
```

### Important notes

- `array` can be empty for non-array visualizations like graphs or networking.
- algorithm-specific visualization state should go in `meta`.
- sidebar details should go in `inspector`.
- `line` must match the active pseudocode line index.
- clone any mutable state before pushing a step.
- never mutate previously-pushed step data.

### `AlgorithmDefinition` caveat

`AlgorithmDefinition` currently allows:

```ts
"sorting" | "graphs" | "trees" | "dp" | "networking"
```

That union lives in `src/algorithms/types.ts`.

If you want a new step-driven category that is not listed there, or you want machine-learning algorithms to use `AlgorithmDefinition`, update that union first.

### Minimal template

```ts
export const MyAlgorithm: AlgorithmDefinition<MyMeta> = {
  id: "my-algorithm",
  name: "My Algorithm",
  category: "sorting",
  pseudocode: [
    "step 1",
    "step 2",
  ],
  generateSteps(input) {
    const data = [...input];
    const steps: Step<MyMeta>[] = [];
    const metrics = { comparisons: 0, swaps: 0 };

    steps.push({
      array: [...data],
      line: 0,
      metrics: { ...metrics },
      note: "Start",
    });

    return steps;
  },
};
```

### When not to use `AlgorithmDefinition`

Some current step-based modules, such as DFS and Paxos, export plain objects with custom `generateSteps(...)` signatures because they do not operate on `number[]` input.

That is acceptable in the current codebase. If your algorithm needs graph input, protocol config, or another structured input, follow the DFS/Paxos style instead of forcing it into the array-only signature.

## 4. Build the Page

Most algorithm pages use `AlgorithmLayout`:

```ts
import { AlgorithmLayout } from "../components/AlgorithmLayout";
```

From there, choose the pieces that fit the visualization.

### Common step-based page pieces

- `PseudocodePanel`
- `PlayerControls`
- `MetricsPanel`, `SearchMetricsPanel`, `NetworkingMetricsPanel`, or another specialized panel
- `StepInspector`
- a visual component such as `ArrayBars`, `GraphView`, `TreeView`, `PaxosView`, or `Rdt30View`
- `usePlayerStore`

### Common interactive page pieces

- `AlgorithmLayout`
- local `useState(...)`
- custom plotting or diagram components
- computed text panels instead of playback controls

### Rule of thumb

- if the experience has Play / Pause / Step, use the player store
- if the experience is a live sandbox with sliders, selectors, and instant recomputation, use local page state

## 5. Wire the Page Into Routing

Add the page import and route in `src/App.tsx`.

Examples from the current app:

```tsx
<Route path="/algorithms/sorting/bubble" element={<BubbleSortPage />} />
<Route path="/algorithms/networking/paxos" element={<PaxosPage />} />
<Route path="/algorithms/machine-learning/linear-regression" element={<LinearRegressionPage />} />
<Route path="/graphs/dfs" element={<DfsPage />} />
```

### Route conventions already in use

- sorting: `/algorithms/sorting/...`
- networking: `/algorithms/networking/...`
- machine learning: `/algorithms/machine-learning/...`
- graphs: `/graphs/...`

Graphs are currently routed from `/graphs`, not `/algorithms/graphs`.

## 6. Add the Algorithm to the Category Page

Each category page has its own list of cards.

Current locations:

- sorting: `src/pages/SortingCatalogPage.tsx`
- graphs: `src/pages/GraphsPage.tsx`
- networking: `src/pages/NetworkingPage.tsx`
- machine learning: `src/pages/MachineLearningPage.tsx`

Add one new object to the relevant list and point it at the new route.

Examples:

- `SORTING_ALGORITHMS`
- `graphAlgorithms`
- `networkingAlgorithms`
- `machineLearningAlgorithms`

## 7. If You Are Adding a Brand-New Category

You need more than just one algorithm file.

### Create the category page

Add a new page in `src/pages`, similar to the existing catalog pages.

### Add a route

Register the category landing page in `src/App.tsx`.

### Add a home screen entry

Update `src/pages/Home.tsx` so users can reach the new category.

### Decide whether shared types need expanding

Update `src/algorithms/types.ts` if the new category should be part of the shared `AlgorithmDefinition["category"]` union.

### Choose route naming deliberately

Match the style of the existing app unless you are intentionally standardizing routes. Right now the repo mixes:

- `/algorithms/<category>/...`
- `/graphs/...`

If you change that structure, expect follow-up edits beyond just the new algorithm.

## 8. Choose the Right Visualization Component

Do not assume every algorithm uses `ArrayBars`.

Current visualization examples:

- `ArrayBars` for array sorting states
- `TreeView` for tree-backed sorting
- `GraphView` for DFS/BFS
- `PaxosView` and `Rdt30View` for networking simulations
- `DataPlot2D` for machine-learning plots

If no current component fits, create a new one in `src/components` and keep algorithm-specific display state inside page props or `step.meta`.

## 9. Metrics and Inspector Guidance

The shared metrics type is still:

```ts
{
  comparisons: number;
  swaps: number;
}
```

For non-sorting algorithms, the project currently reuses those fields as generic counters when needed. For example, networking code uses `comparisons` as a message/event count.

That is acceptable for consistency with the current UI, but if you need richer metrics:

- add a category-specific metrics panel
- keep specialized values in `meta` and/or `inspector`
- avoid overloading shared types more than necessary

## 10. Practical Checklist

Before you consider the feature done, verify:

- the algorithm or helper module lives in the correct category folder
- the page renders without TypeScript errors
- the route is registered in `src/App.tsx`
- the category landing page links to the new route
- the home page links to the category if needed
- playback works if the page is step-based
- pseudocode highlighting matches the intended line numbers
- the chosen visual component updates correctly
- metrics and inspector values make sense
- resetting or regenerating data clears stale playback state when needed

## 11. Good Reference Files

Use these as models when adding similar features:

- array playback: `src/algorithms/sorting/bubbleSort.ts`
- tree-backed playback: `src/pages/TreeSortPage.tsx`
- graph playback with custom meta: `src/pages/DfsPage.tsx`
- networking simulation with custom config: `src/pages/PaxosPage.tsx`
- interactive machine-learning page: `src/pages/LinearRegressionPage.tsx`

## 12. Summary

Adding a new algorithm in AlgoVis usually means touching four layers:

1. algorithm logic in `src/algorithms/...`
2. a page in `src/pages/...`
3. routing in `src/App.tsx`
4. a category listing page, plus `Home.tsx` if the category is new

The main decision is whether the algorithm should be:

- a step-based playback visualization
- a live interactive playground

Start there, then follow the matching pattern already used in the repo.
