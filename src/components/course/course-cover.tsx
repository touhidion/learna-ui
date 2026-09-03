import React from "react";
import { BookOpen, Code, Cpu, GraduationCap, Layers, Sparkles, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

const PALETTES = [
  {
    gradient: "from-indigo-600 via-blue-600 to-slate-900",
    glow: "bg-blue-400/20",
    accent: "text-blue-100",
    ring: "border-blue-400/30",
    icon: Code,
  },
  {
    gradient: "from-emerald-600 via-teal-700 to-slate-900",
    glow: "bg-teal-400/20",
    accent: "text-emerald-100",
    ring: "border-emerald-400/30",
    icon: Layers,
  },
  {
    gradient: "from-amber-600 via-orange-600 to-slate-900",
    glow: "bg-amber-400/20",
    accent: "text-amber-100",
    ring: "border-amber-400/30",
    icon: Sparkles,
  },
  {
    gradient: "from-purple-600 via-fuchsia-700 to-slate-900",
    glow: "bg-purple-400/20",
    accent: "text-purple-100",
    ring: "border-purple-400/30",
    icon: GraduationCap,
  },
  {
    gradient: "from-rose-600 via-pink-700 to-slate-900",
    glow: "bg-rose-400/20",
    accent: "text-rose-100",
    ring: "border-rose-400/30",
    icon: BookOpen,
  },
  {
    gradient: "from-cyan-600 via-sky-700 to-slate-900",
    glow: "bg-cyan-400/20",
    accent: "text-cyan-100",
    ring: "border-cyan-400/30",
    icon: Terminal,
  },
  {
    gradient: "from-violet-600 via-purple-800 to-slate-900",
    glow: "bg-violet-400/20",
    accent: "text-violet-100",
    ring: "border-violet-400/30",
    icon: Cpu,
  },
];

function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function CourseCover({
  title,
  id,
  thumbnailUrl,
  category,
  className,
}: {
  title: string;
  id?: string;
  thumbnailUrl?: string | null;
  category?: string | null;
  className?: string;
}) {
  if (thumbnailUrl) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={thumbnailUrl}
        alt=""
        className={cn("size-full object-cover", className)}
        loading="lazy"
      />
    );
  }

  const hashKey = id || title || "course";
  const palette = PALETTES[stringHash(hashKey) % PALETTES.length];
  const IconComponent = palette.icon;

  return (
    <div
      className={cn(
        "relative flex size-full items-center justify-center overflow-hidden bg-gradient-to-br select-none",
        palette.gradient,
        className,
      )}
    >
      {/* Decorative Grid & Lines */}
      <svg
        className="pointer-events-none absolute inset-0 size-full stroke-white/10 opacity-40 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
        aria-hidden="true"
      >
        <defs>
          <pattern id={`grid-${hashKey}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M.5 24V.5H24" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth="0" fill={`url(#grid-${hashKey})`} />
      </svg>

      {/* Floating Glowing Orb */}
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 size-32 rounded-full blur-2xl",
          palette.glow,
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -left-6 -bottom-6 size-32 rounded-full blur-2xl",
          palette.glow,
        )}
      />

      {/* Watermark Initial/Typography in Background */}
      <div className="pointer-events-none absolute right-2 bottom-1 font-black text-white/5 text-6xl uppercase tracking-tighter">
        {title ? title.slice(0, 2) : "LN"}
      </div>

      {/* Center Frosted Glass Medallion with Course Icon */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div
          className={cn(
            "flex size-14 items-center justify-center rounded-2xl border bg-white/10 shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:scale-110",
            palette.ring,
          )}
        >
          <IconComponent className={cn("size-7", palette.accent)} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}