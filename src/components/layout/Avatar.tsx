import React from "react";

const COLORS = ["#8b5cf6", "#22d3ee", "#34d399", "#fbbf24", "#fb7185", "#6366f1"];

export function Avatar({ name, color, size = 36 }: { name: string; color?: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  const bg = color && COLORS.includes(color) ? color : COLORS[Math.abs(name.charCodeAt(0) ?? 0) % COLORS.length];
  return (
    <span
      className="inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${bg}, ${bg}cc)`, fontSize: size * 0.4 }}
    >
      {initials}
    </span>
  );
}