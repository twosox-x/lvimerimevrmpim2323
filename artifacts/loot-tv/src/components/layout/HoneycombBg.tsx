// Hexagon SVG path (pointy-top orientation)
const HEX_PATH =
  "M50,2 L93,26 L93,74 L50,98 L7,74 L7,26 Z";

interface HexConfig {
  id: number;
  x: number;   // vw
  y: number;   // vh
  size: number; // px
  opacity: number;
  duration: number; // s
  delay: number;    // s
  rotate: number;   // deg initial
  color: string;
  blur: number;
  driftX: number;   // px amplitude
  driftY: number;
  rotateAmt: number;
}

function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildHexagons(): HexConfig[] {
  const r = seededRand(42);
  const COLORS = ["#38bdf8", "#7dd3fc", "#a5f3fc", "#818cf8", "#c084fc"];
  const configs: HexConfig[] = [];
  for (let i = 0; i < 28; i++) {
    configs.push({
      id: i,
      x: r() * 100,
      y: r() * 120 - 10,
      size: 30 + r() * 90,
      opacity: 0.03 + r() * 0.1,
      duration: 14 + r() * 22,
      delay: -(r() * 20),
      rotate: r() * 360,
      color: COLORS[Math.floor(r() * COLORS.length)],
      blur: r() > 0.65 ? 1 + r() * 3 : 0,
      driftX: (r() - 0.5) * 60,
      driftY: (r() - 0.5) * 80,
      rotateAmt: (r() - 0.5) * 30,
    });
  }
  return configs;
}

const HEXAGONS = buildHexagons();

export function HoneycombBg() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-background">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .hex-float { animation-duration: 120s !important; }
        }
        @keyframes hexFloat {
          0%   { transform: translate(0px, 0px) rotate(var(--r0)); }
          33%  { transform: translate(var(--dx), calc(var(--dy) * 0.5)) rotate(calc(var(--r0) + var(--dr) * 0.33)); }
          66%  { transform: translate(calc(var(--dx) * -0.5), var(--dy)) rotate(calc(var(--r0) + var(--dr) * 0.66)); }
          100% { transform: translate(0px, 0px) rotate(calc(var(--r0) + var(--dr))); }
        }
      `}</style>

      {HEXAGONS.map((h) => (
        <div
          key={h.id}
          className="hex-float absolute"
          style={{
            left: `${h.x}vw`,
            top: `${h.y}vh`,
            width: h.size,
            height: h.size,
            opacity: h.opacity,
            filter: h.blur ? `blur(${h.blur}px)` : undefined,
            animationName: "hexFloat",
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDirection: "alternate",
            ["--r0" as string]: `${h.rotate}deg`,
            ["--dr" as string]: `${h.rotateAmt}deg`,
            ["--dx" as string]: `${h.driftX}px`,
            ["--dy" as string]: `${h.driftY}px`,
          }}
        >
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d={HEX_PATH}
              stroke={h.color}
              strokeWidth="1.5"
              fill={h.color}
              fillOpacity="0.04"
              style={{ filter: `drop-shadow(0 0 4px ${h.color}60)` }}
            />
          </svg>
        </div>
      ))}

      {/* Subtle depth gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background/80" />
    </div>
  );
}
