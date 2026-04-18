# AlgoVis

AlgoVis is a React + TypeScript web app for visualizing algorithms step by step. It lets you generate sample data, play through each algorithm's execution, and inspect pseudocode, state changes, and basic metrics as the algorithm runs.

## Features

- Step-by-step algorithm playback
- Pseudocode highlighting for the current step
- Metrics tracking such as comparisons and swaps
- Interactive controls for generating data and replaying steps
- Support for both sorting and graph traversal visualizations

## Current Algorithms

### Sorting

- Bubble Sort
- Insertion Sort
- Quick Sort
- Tree Sort
- Bogo Sort

### Graphs

- Depth-First Search (DFS)
- Breadth-First Search (BFS)

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Zustand
- Tailwind CSS

## Getting Started

### Prerequisites

Make sure you have these installed:

- Node.js
- npm

## Installation

From the `algovis` folder, install dependencies:

```bash
npm install
```

## Running the Project

Start the development server:

```bash
npm run dev
```

Vite will print a local URL in the terminal:

```text
http://localhost:8080
```

## Other Useful Commands

Build the project for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Run ESLint:

```bash
npm run lint
```

## Project Structure

```text
algovis/
  src/
    algorithms/    Algorithm implementations and step generation
    components/    Shared visualization and UI components
    pages/         Route-level pages for each algorithm
    state/         Zustand player state
```

## How It Works

Each algorithm generates a sequence of steps. The UI plays those steps back and updates the visualization, highlighted pseudocode line, and metrics panel for each frame of execution.

## Future Improvements

- Add more sorting algorithms
- Add more graph algorithms
- Add trees, dynamic programming, and greedy algorithms
- Improve documentation and test coverage

## Author

Built as an algorithm visualization project for classwork and learning.
