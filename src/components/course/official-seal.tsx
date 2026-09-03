"use client";

import { cn } from "@/lib/utils";

interface OfficialSealProps {
  className?: string;
  size?: number; // size in px, default 110
  showRibbons?: boolean;
}

/**
 * Authentic Luxury Gold Official Seal.
 * Features a 36-point starburst rosette, embossed concentric rings, beaded ring,
 * circular text, official crest, and dual swallowtail ribbon tails.
 */
export function OfficialSeal({
  className,
  size = 120,
  showRibbons = true,
}: OfficialSealProps) {
  // Generate 36 points for the scalloped starburst rosette
  const points: string[] = [];
  const numPoints = 36;
  const outerR = 54;
  const innerR = 48;
  const cx = 60;
  const cy = 60;

  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  const rosettePath = `M ${points.join(" L ")} Z`;

  // Generate 32 beaded dots around the rim
  const dots: { cx: number; cy: number }[] = [];
  const numDots = 32;
  const dotR = 41.5;
  for (let i = 0; i < numDots; i++) {
    const angle = (i * 2 * Math.PI) / numDots;
    dots.push({
      cx: Number((cx + dotR * Math.cos(angle)).toFixed(2)),
      cy: Number((cy + dotR * Math.sin(angle)).toFixed(2)),
    });
  }

  return (
    <div
      className={cn(
        "relative inline-flex flex-col items-center justify-center select-none group filter drop-shadow-md",
        className,
      )}
      style={{ width: size, height: showRibbons ? size * 1.32 : size }}
    >
      <svg
        viewBox="0 0 120 156"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Metallic Gold Gradients */}
          <linearGradient id="sealGoldFoil" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D77F" />
            <stop offset="25%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#FFF2B2" />
            <stop offset="75%" stopColor="#AA771C" />
            <stop offset="100%" stopColor="#E6C260" />
          </linearGradient>

          <linearGradient id="sealDarkGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#966810" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#784E07" />
          </linearGradient>

          <linearGradient id="sealRibbonLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C59122" />
            <stop offset="50%" stopColor="#E8C262" />
            <stop offset="100%" stopColor="#8E620E" />
          </linearGradient>

          <linearGradient id="sealRibbonRight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C59122" />
            <stop offset="50%" stopColor="#E8C262" />
            <stop offset="100%" stopColor="#8E620E" />
          </linearGradient>

          <radialGradient id="sealInnerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFBF0" />
            <stop offset="65%" stopColor="#FBF4DD" />
            <stop offset="100%" stopColor="#E7CF8C" />
          </radialGradient>

          <filter id="sealShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#452600" floodOpacity="0.25" />
          </filter>

          {/* Circular Text Paths */}
          <path
            id="textPathTop"
            d="M 23,60 A 37,37 0 0,1 97,60"
            fill="none"
          />
          <path
            id="textPathBottom"
            d="M 97,60 A 37,37 0 0,1 23,60"
            fill="none"
          />
        </defs>

        {/* Hanging Ribbons (drawn beneath rosette) */}
        {showRibbons && (
          <g filter="url(#sealShadow)">
            {/* Left Ribbon with swallowtail notch */}
            <path
              d="M 43,88 L 30,146 L 47,136 L 56,146 L 53,88 Z"
              fill="url(#sealRibbonLeft)"
              stroke="#8E620E"
              strokeWidth="0.8"
            />
            {/* Left ribbon inner gold stripe */}
            <path
              d="M 43,92 L 35,140 L 47,133 L 52,140 L 49,92"
              fill="none"
              stroke="#FFF2B2"
              strokeWidth="0.6"
              strokeOpacity="0.8"
            />

            {/* Right Ribbon with swallowtail notch */}
            <path
              d="M 77,88 L 67,146 L 76,136 L 93,146 L 80,88 Z"
              fill="url(#sealRibbonRight)"
              stroke="#8E620E"
              strokeWidth="0.8"
            />
            {/* Right ribbon inner gold stripe */}
            <path
              d="M 74,92 L 71,140 L 76,133 L 88,140 L 78,92"
              fill="none"
              stroke="#FFF2B2"
              strokeWidth="0.6"
              strokeOpacity="0.8"
            />
          </g>
        )}

        {/* Medallion Body */}
        <g filter="url(#sealShadow)">
          {/* 36-Point Serrated Starburst Rosette */}
          <path
            d={rosettePath}
            fill="url(#sealGoldFoil)"
            stroke="url(#sealDarkGold)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Outer Polished Ring */}
          <circle
            cx={cx}
            cy={cy}
            r="46"
            fill="none"
            stroke="#966810"
            strokeWidth="1"
          />

          {/* Golden Contrast Ring */}
          <circle
            cx={cx}
            cy={cy}
            r="44"
            fill="none"
            stroke="#FFF2B2"
            strokeWidth="1.2"
          />

          {/* Beaded Ring Frame */}
          <circle
            cx={cx}
            cy={cy}
            r="38"
            fill="none"
            stroke="#966810"
            strokeWidth="0.8"
          />
          {dots.map((d, idx) => (
            <circle
              key={idx}
              cx={d.cx}
              cy={d.cy}
              r="0.9"
              fill="#784E07"
            />
          ))}

          {/* Center Parchment Medallion Plate */}
          <circle
            cx={cx}
            cy={cy}
            r="35.5"
            fill="url(#sealInnerGlow)"
            stroke="#C59122"
            strokeWidth="1.2"
          />

          {/* Inner Inset Hairline */}
          <circle
            cx={cx}
            cy={cy}
            r="33.5"
            fill="none"
            stroke="#966810"
            strokeWidth="0.5"
            strokeDasharray="1.5 1.5"
          />

          {/* Circular Text: OFFICIAL SEAL (Top Arc) */}
          <text
            fill="#784E07"
            fontSize="5.2"
            fontWeight="900"
            letterSpacing="2.2"
            className="font-sans"
          >
            <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">
              OFFICIAL SEAL
            </textPath>
          </text>

          {/* Circular Text: VERIFIED • ACCREDITED (Bottom Arc) */}
          <text
            fill="#784E07"
            fontSize="4.8"
            fontWeight="800"
            letterSpacing="2.2"
            className="font-sans"
          >
            <textPath href="#textPathBottom" startOffset="50%" textAnchor="middle">
              • VERIFIED •
            </textPath>
          </text>

          {/* Center Emblem: Triple Star & Laurel Accent */}
          <g transform={`translate(${cx}, ${cy})`}>
            {/* Center Main Star */}
            <path
              d="M 0,-7.5 L 2,-2 L 7.5,-2 L 3,1.5 L 4.8,7 L 0,3.5 L -4.8,7 L -3,1.5 L -7.5,-2 L -2,-2 Z"
              fill="url(#sealDarkGold)"
              stroke="#5C3B02"
              strokeWidth="0.4"
            />

            {/* Left Flank Star */}
            <path
              d="M -11,-2 L -9.5,1.5 L -6,1.5 L -8.8,3.8 L -7.5,7 L -11,4.8 L -14.5,7 L -13.2,3.8 L -16,1.5 L -12.5,1.5 Z"
              transform="scale(0.55) translate(-10, -5)"
              fill="#966810"
            />

            {/* Right Flank Star */}
            <path
              d="M 11,-2 L 9.5,1.5 L 6,1.5 L 8.8,3.8 L 7.5,7 L 11,4.8 L 14.5,7 L 13.2,3.8 L 16,1.5 L 12.5,1.5 Z"
              transform="scale(0.55) translate(10, -5)"
              fill="#966810"
            />

            {/* Micro Badge Banner: LEARNA */}
            <rect
              x="-16"
              y="6"
              width="32"
              height="6"
              rx="1.5"
              fill="#784E07"
            />
            <text
              x="0"
              y="10.4"
              textAnchor="middle"
              fill="#FFF2B2"
              fontSize="3.8"
              fontWeight="900"
              letterSpacing="1.2"
            >
              LEARNA
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}