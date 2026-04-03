export type PlotClassName = "default" | "classB";

export type PlotPoint = {
  x: number;
  y: number;
  className?: PlotClassName;
};

export type ClassifiedPoint = PlotPoint & {
  label: 0 | 1;
  className: PlotClassName;
};

export type FittedLine = {
  start: PlotPoint;
  end: PlotPoint;
  label?: string;
};
