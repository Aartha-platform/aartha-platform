"use client";

import { motion } from 'framer-motion';

export default function GlobalBuyerMap() {
  // Hub origin: Gujarat, India — positioned on the right side of a simplified world layout
  const hub: [number, number] = [420, 210];

  const routes = [
    { name: 'USA',          end: [120, 140] as [number, number], delay: 0,   labelAnchor: 'end'   as const },
    { name: 'Germany',      end: [310, 100] as [number, number], delay: 0.6, labelAnchor: 'middle' as const },
    { name: 'UAE',          end: [390, 190] as [number, number], delay: 1.2, labelAnchor: 'end'   as const },
    { name: 'Brazil',       end: [190, 290] as [number, number], delay: 1.8, labelAnchor: 'middle' as const },
    { name: 'E. Africa',    end: [370, 260] as [number, number], delay: 2.4, labelAnchor: 'end'   as const },
    { name: 'Singapore',    end: [510, 240] as [number, number], delay: 3.0, labelAnchor: 'start' as const },
  ];

  // Dot grid for abstract world background
  const dotGrid: [number, number][] = [];
  for (let x = 30; x < 580; x += 28) {
    for (let y = 50; y < 370; y += 28) {
      // Skip some dots randomly for organic feel (deterministic)
      const hash = (x * 31 + y * 17) % 100;
      if (hash < 35) dotGrid.push([x, y]);
    }
  }

  return (
    <div className="relative w-full max-w-lg mx-auto bg-[#0a1628]/80 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-sm overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-[7px] font-bold text-amber-400/70 uppercase tracking-[0.2em] block font-mono">Live Sourcing Telemetry</span>
          <h4 className="text-white text-[11px] font-bold font-sans leading-tight">Global Trade Corridor Map</h4>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[7px] font-mono text-emerald-400/70 uppercase tracking-wider">Live</span>
        </div>
      </div>

      <svg viewBox="0 0 580 380" className="w-full h-auto">
        <defs>
          {/* Hub glow gradient */}
          <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
          </radialGradient>
          {/* Gujarat state fill */}
          <radialGradient id="gjFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#34D399" stopOpacity="0.08" />
          </radialGradient>
        </defs>

        {/* Dot grid world background */}
        {dotGrid.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1" fill="rgba(255,255,255,0.07)" />
        ))}

        {/* === Simplified India Outline (recognizable shape) === */}
        <path
          d={`
            M 432 155
            L 440 158 L 448 165 L 455 162 L 462 168
            L 465 175 L 460 182 L 465 190 L 462 198
            L 458 205 L 450 215 L 445 228
            L 440 245 L 438 255 L 435 262 L 432 268
            L 430 262 L 425 252 L 420 242
            L 415 235 L 408 230 L 402 228
            L 398 222 L 400 215
            L 405 208 L 402 200
            L 405 193 L 410 188
            L 408 180 L 412 172
            L 418 168 L 425 160
            Z
          `}
          fill="rgba(255, 255, 255, 0.03)"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* Gujarat state highlighted region (western bulge) */}
        <path
          d={`
            M 402 228 L 398 222 L 400 215 L 405 208
            L 410 215 L 415 224 L 420 232
            L 415 235 L 408 230
            Z
          `}
          fill="url(#gjFill)"
          stroke="#34D399"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Hub radar rings */}
        <motion.circle
          cx={hub[0]} cy={hub[1]} r="18"
          fill="url(#hubGlow)"
          animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <circle cx={hub[0]} cy={hub[1]} r="10" fill="none" stroke="#34D399" strokeWidth="0.5" opacity="0.25" />
        <circle cx={hub[0]} cy={hub[1]} r="5" fill="none" stroke="#34D399" strokeWidth="0.6" opacity="0.4" />
        <circle cx={hub[0]} cy={hub[1]} r="3" fill="#34D399" />

        {/* GUJARAT label near hub */}
        <text x={hub[0]} y={hub[1] + 26} fill="none" stroke="#0a1628" strokeWidth="3.5" strokeLinejoin="round"
          fontSize="10" fontWeight="900" textAnchor="middle" className="font-sans">GUJARAT, INDIA</text>
        <text x={hub[0]} y={hub[1] + 26} fill="#34D399" fontSize="10" fontWeight="900" textAnchor="middle"
          className="font-sans" style={{ letterSpacing: '0.12em' }}>GUJARAT, INDIA</text>

        {/* Trade corridor arcs & animated traveling dots */}
        {routes.map((route, i) => {
          const [x1, y1] = hub;
          const [x2, y2] = route.end;

          // Control point — arc upward for aesthetics
          const cpx = (x1 + x2) / 2;
          const cpy = Math.min(y1, y2) - 35 - (i % 2) * 15;
          const pathD = `M${x1},${y1} Q${cpx},${cpy} ${x2},${y2}`;
          const pathId = `route-${i}`;

          // Label offset to avoid overlap
          const ly = y2 < 150 ? y2 - 12 : y2 + 18;

          return (
            <g key={i}>
              {/* Ghost arc */}
              <path d={pathD} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

              {/* Visible arc line */}
              <motion.path
                d={pathD}
                fill="none"
                stroke="rgba(251, 191, 36, 0.2)"
                strokeWidth="1"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: route.delay, ease: "easeOut" }}
              />

              {/* Traveling particle dot along arc */}
              <path id={pathId} d={pathD} fill="none" stroke="none" />
              <motion.circle
                r="2.5"
                fill="#FBBF24"
                filter="url(#none)"
                initial={{ "--offset-distance": "0%" } as any}
                animate={{ "--offset-distance": "100%" } as any}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: route.delay,
                  repeatDelay: 1,
                }}
                style={{ 
                  offsetPath: `path("${pathD}")`, 
                  offsetRotate: '0deg',
                  offsetDistance: 'var(--offset-distance)' as any
                }}
              />
              {/* Particle glow trail */}
              <motion.circle
                r="5"
                fill="rgba(251,191,36,0.15)"
                initial={{ "--offset-distance": "0%" } as any}
                animate={{ "--offset-distance": "100%" } as any}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: route.delay,
                  repeatDelay: 1,
                }}
                style={{ 
                  offsetPath: `path("${pathD}")`, 
                  offsetRotate: '0deg',
                  offsetDistance: 'var(--offset-distance)' as any
                }}
              />

              {/* Destination marker */}
              <circle cx={x2} cy={y2} r="2" fill="#FBBF24" />
              <circle cx={x2} cy={y2} r="4.5" fill="none" stroke="#FBBF24" strokeWidth="0.6" opacity="0.5" />

              {/* Destination label — positioned to avoid overlap */}
              <text x={x2} y={ly} fill="none" stroke="#0a1628" strokeWidth="3.5" strokeLinejoin="round"
                fontSize="13" fontWeight="800" textAnchor={route.labelAnchor} className="font-sans">
                {route.name}
              </text>
              <text x={x2} y={ly} fill="rgba(251,191,36,0.95)" fontSize="13" fontWeight="800"
                textAnchor={route.labelAnchor} className="font-sans" style={{ letterSpacing: '0.05em' }}>
                {route.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Footer telemetry bar */}
      <div className="flex justify-between text-[7px] font-mono text-white/30 pt-1.5 border-t border-white/5 mt-1">
        <span>Hub: Gujarat GIDC Corridors</span>
        <span>Secure Georouting Active</span>
      </div>
    </div>
  );
}
