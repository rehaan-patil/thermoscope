"use client";

import React from "react";

export const ChartDefs: React.FC = () => (
  <defs>
    {/* Electric Neon Blue to Cyan Gradient */}
    <linearGradient id="neonBlueCyan" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#3b82f6" />
      <stop offset="100%" stopColor="#00e5ff" />
    </linearGradient>

    {/* Cybernetic Violet to Neon Blue Gradient */}
    <linearGradient id="neonVioletBlue" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#8b5cf6" />
      <stop offset="100%" stopColor="#3b82f6" />
    </linearGradient>

    {/* Shimmering Transparent Area Fill for Temperature / Events */}
    <linearGradient id="glowAreaBlue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.35} />
      <stop offset="60%" stopColor="#3b82f6" stopOpacity={0.08} />
      <stop offset="100%" stopColor="#000000" stopOpacity={0.0} />
    </linearGradient>

    {/* Shimmering Translucent Garwood Envelope Area */}
    <linearGradient id="garwoodEnvelopeGlow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.03} />
    </linearGradient>

    {/* Warning Threshold Shimmer */}
    <linearGradient id="warningGlow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.0} />
    </linearGradient>
  </defs>
);

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: any;
  threshold?: number;
  unit?: string;
  garwoodLower?: number;
  garwoodUpper?: number;
}

export const GlassChartTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  threshold,
  unit = "°C",
  garwoodLower,
  garwoodUpper,
}) => {
  if (!active || !payload || !payload.length) return null;

  const primaryValue = typeof payload[0]?.value === "number" ? payload[0].value : null;
  const isExceeding = threshold && primaryValue !== null ? primaryValue >= threshold : false;

  return (
    <div className="bg-[#030303]/95 backdrop-blur-2xl border border-white/10 rounded-xl p-3.5 shadow-[0_15px_35px_rgba(0,0,0,0.9),0_0_15px_rgba(59,130,246,0.15)] text-xs font-mono min-w-[210px] animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
        <span className="font-bold text-white flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Index #{label}
        </span>
        {isExceeding ? (
          <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded">
            Exceedance
          </span>
        ) : (
          <span className="text-[10px] uppercase text-gray-500 font-bold bg-white/5 px-1.5 py-0.5 rounded">
            Nominal
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-gray-400">
              <span
                className="h-2 w-2 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: entry.color || entry.stroke || "#00e5ff" }}
              />
              <span className="truncate max-w-[110px]">{entry.name}:</span>
            </span>
            <span className="font-bold text-white font-mono">
              {typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value} {unit}
            </span>
          </div>
        ))}

        {threshold && primaryValue !== null && (
          <div className="pt-1.5 mt-1.5 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
            <span>Threshold Δ:</span>
            <span
              className={`font-bold font-mono ${
                primaryValue - threshold >= 0 ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              {primaryValue - threshold >= 0 ? "+" : ""}
              {(primaryValue - threshold).toFixed(2)} {unit}
            </span>
          </div>
        )}

        {garwoodLower !== undefined && garwoodUpper !== undefined && (
          <div className="flex items-center justify-between text-[10px] text-purple-300/80">
            <span>Garwood 95% CI:</span>
            <span className="font-mono">
              [{garwoodLower.toFixed(2)}, {garwoodUpper.toFixed(2)}]
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
