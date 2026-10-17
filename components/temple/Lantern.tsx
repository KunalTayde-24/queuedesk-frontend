/** Shared gradient / glow defs used by <Lantern>. Render once on any page that draws lanterns. */
export function LanternDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="lanG" cx=".38" cy=".35" r=".75">
          <stop offset="0" stopColor="#FF8A5C" />
          <stop offset=".5" stopColor="#D9271C" />
          <stop offset="1" stopColor="#7C0F0B" />
        </radialGradient>
        <radialGradient id="lglow">
          <stop offset="0" stopColor="#FFB25A" stopOpacity=".7" />
          <stop offset="1" stopColor="#FFB25A" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/** A hanging red lantern, drawn inside an <svg>. Needs <LanternDefs /> on the page. */
export function Lantern({
  x,
  y,
  scale = 1,
  delay = 0,
}: {
  x: number;
  y: number;
  scale?: number;
  delay?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className="t-sway t-glow" style={{ animationDelay: `${delay}s` }}>
        <line x1="0" y1="0" x2="0" y2="18" stroke="#D9A441" strokeWidth="2" />
        <rect x="-8" y="17" width="16" height="5" rx="1.5" fill="#D9A441" />
        <ellipse cx="0" cy="40" rx="30" ry="26" fill="url(#lglow)" />
        <ellipse cx="0" cy="40" rx="20" ry="20" fill="url(#lanG)" />
        <path d="M0 21v38M-10 23q-6 17 0 34M10 23q6 17 0 34" stroke="#A81F17" strokeWidth="1.6" fill="none" />
        <text x="0" y="46" textAnchor="middle" fontSize="16" fill="#FFD77A" fontFamily="var(--font-ma-shan), serif">
          福
        </text>
        <rect x="-8" y="58" width="16" height="5" rx="1.5" fill="#D9A441" />
        <path d="M0 63v16M-3 63v12M3 63v12" stroke="#D9A441" strokeWidth="2" />
      </g>
    </g>
  );
}
