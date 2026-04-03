type PerceptronDiagramProps = {
  w1: number;
  w2: number;
  bias: number;
};

function formatValue(value: number) {
  return value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
}

export function PerceptronDiagram({ w1, w2, bias }: PerceptronDiagramProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
      <div className="text-sm text-zinc-300">Perceptron Diagram</div>
      <div className="mt-3 overflow-x-auto">
        <svg
          viewBox="0 0 520 220"
          className="w-full min-w-[420px]"
          role="img"
          aria-label="Perceptron with two inputs, one neuron, and one output"
        >
          <defs>
            <marker
              id="perceptron-arrow"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="rgb(161 161 170)" />
            </marker>
          </defs>

          <rect x="24" y="44" width="88" height="36" rx="18" fill="rgba(24,24,27,0.9)" stroke="rgb(63 63 70)" />
          <rect x="24" y="140" width="88" height="36" rx="18" fill="rgba(24,24,27,0.9)" stroke="rgb(63 63 70)" />
          <rect x="184" y="92" width="88" height="36" rx="18" fill="rgba(24,24,27,0.9)" stroke="rgb(63 63 70)" />
          <circle cx="346" cy="110" r="42" fill="rgba(39,39,42,0.95)" stroke="rgb(250 204 21)" strokeWidth="2.5" />
          <rect x="420" y="92" width="76" height="36" rx="18" fill="rgba(24,24,27,0.9)" stroke="rgb(63 63 70)" />

          <line x1="112" y1="62" x2="184" y2="92" stroke="rgb(161 161 170)" strokeWidth="2.5" markerEnd="url(#perceptron-arrow)" />
          <line x1="112" y1="158" x2="184" y2="128" stroke="rgb(161 161 170)" strokeWidth="2.5" markerEnd="url(#perceptron-arrow)" />
          <line x1="272" y1="110" x2="304" y2="110" stroke="rgb(161 161 170)" strokeWidth="2.5" markerEnd="url(#perceptron-arrow)" />
          <line x1="388" y1="110" x2="420" y2="110" stroke="rgb(161 161 170)" strokeWidth="2.5" markerEnd="url(#perceptron-arrow)" />

          <text x="68" y="66" textAnchor="middle" fontSize="15" fill="rgb(228 228 231)">x1</text>
          <text x="68" y="162" textAnchor="middle" fontSize="15" fill="rgb(228 228 231)">x2</text>
          <text x="228" y="115" textAnchor="middle" fontSize="15" fill="rgb(228 228 231)">weights</text>
          <text x="346" y="104" textAnchor="middle" fontSize="15" fill="rgb(250 204 21)">Σ</text>
          <text x="346" y="124" textAnchor="middle" fontSize="11" fill="rgb(212 212 216)">step</text>
          <text x="458" y="115" textAnchor="middle" fontSize="15" fill="rgb(228 228 231)">ŷ</text>

          <text x="142" y="60" fontSize="12" fill="rgb(96 165 250)">w1 {formatValue(w1)}</text>
          <text x="142" y="154" fontSize="12" fill="rgb(248 113 113)">w2 {formatValue(w2)}</text>
          <text x="314" y="58" fontSize="12" fill="rgb(212 212 216)">bias {formatValue(bias)}</text>

          <line x1="314" y1="64" x2="336" y2="78" stroke="rgb(161 161 170)" strokeWidth="2" markerEnd="url(#perceptron-arrow)" />
        </svg>
      </div>
      <div className="mt-2 text-xs text-zinc-500">
        The perceptron computes `w1*x1 + w2*x2 + bias`, then applies a threshold to choose a class.
      </div>
    </div>
  );
}
