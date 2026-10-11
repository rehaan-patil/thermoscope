"use client";

import React from "react";
import { FullAnalysisResponse } from "@/types/thermoscope";
import { Sliders } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { ChartDefs, GlassChartTooltip } from "./ChartPrimitives";
import { motion } from "framer-motion";

interface ThresholdSensitivityViewProps {
  data: FullAnalysisResponse;
  currentThreshold: number;
  onSelectThreshold: (th: number) => void;
}

export const ThresholdSensitivityView: React.FC<ThresholdSensitivityViewProps> = ({
  data,
  currentThreshold,
  onSelectThreshold,
}) => {
  if (!data) return null;

  const { threshold_sensitivity } = data;
  const { points, narrative, disclaimer } = threshold_sensitivity || {};

  const chartData = points
    ? points.map((p) => ({
        threshold: `${p.threshold_c}°C`,
        thVal: p.threshold_c,
        rate: p.lambda_rate,
        totalEvents: p.total_events,
        dispersion: p.dispersion_index ?? 1.0,
        activeCycles: p.cycles_with_events,
      }))
    : [];

  const activePoint =
    points && points.length > 0
      ? points.find((p) => Math.abs(p.threshold_c - currentThreshold) < 0.1) || points[0]
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="rounded-2xl border border-white/5 bg-[#080808]/90 backdrop-blur-xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase mb-2">
          <Sliders className="h-4 w-4" /> Feature 4 — Threshold Sensitivity Studio
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono">
          Analytical Threshold Continuum Response
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-400 max-w-4xl leading-relaxed font-mono">
          Evaluating how varying the operational temperature threshold (36.0°C to 45.0°C) shifts
          event counts, Poisson rate parameters, and downstream alert sensitivities.
        </p>
      </div>

      {/* Threshold Selector Strip */}
      <div className="rounded-2xl border border-white/5 bg-[#050505] p-4 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
        <label className="text-[11px] font-mono uppercase text-gray-500 block mb-2 font-bold tracking-wider">
          Select Analytical Scenario Threshold:
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {points &&
            points.map((p) => {
              const isSelected = Math.abs(p.threshold_c - currentThreshold) < 0.1;
              return (
                <button
                  key={p.threshold_c}
                  onClick={() => onSelectThreshold(p.threshold_c)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                    isSelected
                      ? "bg-cyan-400 text-black shadow-md shadow-cyan-500/20 ring-1 ring-cyan-300"
                      : "bg-[#0e0e0e] text-gray-300 hover:text-white hover:bg-[#141414] border border-white/5"
                  }`}
                >
                  {p.threshold_c.toFixed(1)}°C
                </button>
              );
            })}
        </div>
      </div>

      {/* Sensitivity Curves Plot */}
      <div className="rounded-2xl border border-white/5 bg-[#050505] p-5 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Event Rate Response vs. Temperature Threshold
            </h3>
            <p className="text-[11px] text-gray-500 font-mono mt-0.5">
              Parametric response demonstrates how statistical conclusions depend on threshold selection.
            </p>
          </div>
        </div>

        <div className="h-64 w-full min-w-0">
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <ChartDefs />
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.04} />
                <XAxis dataKey="threshold" stroke="#555555" fontSize={10} tickLine={false} />
                <YAxis yAxisId="left" stroke="#00e5ff" fontSize={10} tickLine={false} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#f59e0b"
                  fontSize={10}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ stroke: "#ffffff", strokeOpacity: 0.1, strokeWidth: 1 }}
                  content={<GlassChartTooltip unit="" />}
                />
                <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace" }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="rate"
                  stroke="#00e5ff"
                  strokeWidth={2.2}
                  name="Poisson Rate λ"
                  activeDot={{ r: 5, fill: "#00e5ff" }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="totalEvents"
                  stroke="#f59e0b"
                  strokeWidth={2.2}
                  name="Total Observed Events"
                  activeDot={{ r: 5, fill: "#f59e0b" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Narrative & Active Scenario Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/5 bg-[#050505] p-5 shadow-[0_4px_25px_rgba(0,0,0,0.8)] space-y-2">
          <h4 className="text-[11px] font-mono uppercase text-gray-500 font-bold tracking-wider">
            Sensitivity Synthesis
          </h4>
          <p className="text-xs text-gray-300 leading-relaxed font-mono">{narrative}</p>
        </div>

        {activePoint && (
          <div className="rounded-2xl border border-white/5 bg-[#050505] p-5 shadow-[0_4px_25px_rgba(0,0,0,0.8)] space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="text-[11px] font-mono uppercase text-gray-500 font-bold tracking-wider">
                Active Scenario: {activePoint.threshold_c.toFixed(1)}°C
              </h4>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {activePoint.total_events} Total Events
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c0c0c] border border-white/5">
                <span className="text-gray-500">Estimated Rate:</span>
                <span className="font-bold text-white">{activePoint.lambda_rate.toFixed(3)} / cycle</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c0c0c] border border-white/5">
                <span className="text-gray-500">Active Cycles:</span>
                <span className="font-bold text-white">
                  {activePoint.cycles_with_events} ({activePoint.percent_cycles_with_events}%)
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c0c0c] border border-white/5">
                <span className="text-gray-500">Waiting Intervals:</span>
                <span className="font-bold text-white">{activePoint.n_waiting_intervals}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analytical Disclaimer */}
      <div className="rounded-2xl border border-white/5 bg-[#050505] p-4 text-[11px] text-gray-500 font-mono shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
        <strong>Disclaimer:</strong> {disclaimer || "Threshold sensitivity maps parametric response; these are analytical scenarios, not certified physical limits."}
      </div>
    </motion.div>
  );
};
