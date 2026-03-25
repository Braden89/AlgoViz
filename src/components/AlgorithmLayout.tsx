import React from "react";

export function AlgorithmLayout(props: {
  title: string;
  headerRight?: React.ReactNode;
  left: React.ReactNode;
  right: React.ReactNode;
  bottom?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold">{props.title}</h1>
          {props.headerRight ? props.headerRight : null}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            {props.left}
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            {props.right}
          </div>
        </div>

        {props.bottom ? (
          <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            {props.bottom}
          </div>
        ) : null}
      </div>
    </div>
  );
}
