import { create } from "zustand";
import type { Step } from "../algorithms/types";

type PlayerState = {
  steps: Step[];
  index: number;
  isPlaying: boolean;
  speedMs: number;

  setSteps: (steps: Step[]) => void;
  setIndex: (i: number) => void;

  next: () => void;
  prev: () => void;
  reset: () => void;

  setPlaying: (v: boolean) => void;
  setSpeedMs: (ms: number) => void;
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  steps: [],
  index: 0,
  isPlaying: false,
  speedMs: 300,

  setSteps: (steps) => set({ steps, index: 0, isPlaying: false }),
  setIndex: (i) => {
    const { steps } = get();
    const max = Math.max(0, steps.length - 1);
    const clamped = Math.max(0, Math.min(i, max));
    set({ index: clamped });
  },

  next: () => {
    const { index, steps } = get();
    if (index < steps.length - 1) set({ index: index + 1 });
  },
  prev: () => {
    const { index } = get();
    if (index > 0) set({ index: index - 1 });
  },
  reset: () => set({ index: 0, isPlaying: false }),

  setPlaying: (v) => set({ isPlaying: v }),
  setSpeedMs: (ms) => set({ speedMs: ms }),
}));
