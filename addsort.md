# 🧠 AlgoViz — Adding a New Sorting Algorithm

This document describes **everything required** to add a new sorting algorithm to **AlgoViz**, from algorithm implementation to UI integration.

---

## 1️⃣ Implement the Algorithm Definition

**Location**

```
src/algorithms/sorting/<algorithmName>.ts
```

Every sorting algorithm must export an `AlgorithmDefinition`.

```ts
export const MySort: AlgorithmDefinition<MetaType> = { ... };
```

### Required fields

```ts
{
  id: string;              // unique, URL-safe identifier (kebab-case)
  name: string;            // display name
  category: "sorting";     // always "sorting"
  pseudocode: string[];    // line-by-line pseudocode
  generateSteps(input): Step[];
}
```

---

## 2️⃣ Define Algorithm-Specific Metadata (Optional)

If the algorithm needs extra visualization data (e.g. pivot, pointers, ranges), define a **meta type**:

```ts
type MySortMeta = {
  pivotIndex?: number;
  left?: number;
  right?: number;
};
```

Use generics:

```ts
AlgorithmDefinition<MySortMeta>
Step<MySortMeta>
```

Algorithms without extra visualization needs should use `Step<undefined>`.

---

## 3️⃣ Generate Steps Correctly

Inside `generateSteps(input)`:

### Required behavior

* Clone the input array before mutating
* Never mutate an array **after** pushing a step
* Increment metrics manually

### Required `Step` fields

```ts
{
  array: number[];
  line: number;          // index into pseudocode array
  metrics: {
    comparisons: number;
    swaps: number;
  };
}
```

### Optional `Step` fields

Use only when relevant:

* `active?: number[]`
* `swap?: [number, number]`
* `note?: string`
* `meta?: MetaType` (algorithm-specific)

---

## 4️⃣ Visualization Compatibility (`ArrayBars`)

* `ArrayBars` always accepts `Step<any>`
* Algorithm-specific visuals must live in `step.meta`
* **Do not add fields directly to `Step`** for one algorithm

This ensures:

* Bubble / Insertion Sort remain simple
* Quick Sort can show pivot, ranges, pointers

---

## 5️⃣ Create a Page Component

**Location**

```
src/pages/<AlgorithmName>Page.tsx
```

### Required structure

Every algorithm page must use:

* `AlgorithmLayout`
* `ArrayBars`
* `PseudocodePanel`
* `MetricsPanel`
* `PlayerControls`

### Required imports

```ts
import { AlgorithmLayout } from "../components/AlgorithmLayout";
import { ArrayBars } from "../components/ArrayBars";
import { PseudocodePanel } from "../components/PseudocodePanel";
import { MetricsPanel } from "../components/MetricPanel";
import { PlayerControls } from "../components/PlayerControls";
import { usePlayerStore } from "../state/playerStore";
```

---

## 6️⃣ Hook Algorithm Into Player Store

Use the player store to load steps:

```ts
onClick={() => setSteps(MySort.generateSteps(seedArray))}
```

The store accepts:

```ts
Step<any>[]
```

No casting is required.

---

## 7️⃣ Add Route

**Location**

```
src/App.tsx
```

Add:

```tsx
<Route path="/algorithms/sorting/my-sort" element={<MySortPage />} />
```

---

## 8️⃣ Add to Sorting Catalog

**Location**

```
src/pages/SortingCatalogPage.tsx
```

Add one entry:

```ts
{
  name: "My Sort",
  path: "/algorithms/sorting/my-sort",
  description: "One-line explanation",
  tags: ["Time complexity", "Stability", "Notes"],
}
```

No UI changes are required.

---

## 9️⃣ Naming Conventions

| Item             | Convention                           |
| ---------------- | ------------------------------------ |
| Algorithm IDs    | kebab-case                           |
| File names       | `camelCase.ts`, `PascalCasePage.tsx` |
| Meta fields      | camelCase                            |
| Pseudocode lines | Must align with `line` indexes       |

---

## 🔟 Minimal Test Checklist

Before considering the algorithm complete:

* [ ] Steps generate without runtime errors
* [ ] Pseudocode highlights correctly
* [ ] Array bars update every step
* [ ] Metrics increment correctly
* [ ] Player controls work (play/pause/step/reset)
* [ ] Works with random arrays (size 5–80)

---

## 🏁 Result

Once all steps above are complete, the algorithm:

* is fully visualized
* integrates cleanly with AlgoViz
* requires **no changes** to shared infrastructure

---

*Last updated: AlgoViz Quick Sort integration*
