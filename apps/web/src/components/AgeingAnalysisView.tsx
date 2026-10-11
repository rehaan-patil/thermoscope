"use client";

import React from "react";
import { FullAnalysisResponse } from "@/types/thermoscope";
import { TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ChartDefs, GlassChartTooltip } from "./ChartPrimitives";
import { motion } from "framer-motion";

interface AgeingAnalysisViewProps {
  data: FullAnalysisResponse;
}

export const AgeingAnalysisView: React.FC<AgeingAnalysisViewProps> = ({ data }) => {
  if (!data) return null;

  const { regime_shift } = data;
  const { stages, has_regime_shift, conclusion, shift_evidence, recommendation, caveat } =
    regime_shift || {};

  const barChartData = stages
    ? stages.map((s) => ({
        name: s.stage_name.split("(")[0].trim(),
        rate: s.lambda_rate,
        ciLower: s.lambda_ci_95[0],
        ciUpper: s.lambda_ci_95[1],
        pctActive: s.percent_cycles_with_events,
        maxTemp: s.max_temperature,
      }))
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="rounded-2xl border border-white/5 bg-[#080808]/90 backdrop-blur-xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-bold uppercase mb-2">
          <TrendingUp className="h-4 w-4" /> Feature 3 — Thermal Regime Shift Explorer
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono">
          Lifecycle Ageing Stages & Non-Stationary Rate Divergence
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-400 max-w-4xl leading-relaxed font-mono">
          As lithium-ion cells experience degradation (SEI growth and capacity fade), internal resistance
          rises, generating severe Joule heating. ThermoScope partitions the operational life to test
          whether the homogeneous Poisson constant-rate assumption holds across degradation regimes.
        </p>
      </div>

      {/* Regime Shift Verdict Banner */}
      <div
        className={`rounded-2xl border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_4px_25px_rgba(0,0,0,0.8)] ${
          has_regime_shift
            ? "border-amber-500/30 bg-[#0c0904]"
            : "border-emerald-500/30 bg-[#040c08]"
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2.5 rounded-xl mt-0.5 ${
              has_regime_shift
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            }`}
          >
            {has_regime_shift ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <ShieldCheck className="h-5 w-5" />
            )}
          </div>
          <div>
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">{conclusion}</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl font-mono">{recommendation}</p>
            {shift_evidence && shift_evidence.length > 0 && (
              <div className="mt-2 text-xs text-amber-300/90 font-mono space-y-0.5">
                {shift_evidence.map((ev, i) => (
                  <div key={i}>• {ev}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        <span
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border ${
            has_regime_shift
              ? "bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
          }`}
        >
          {has_regime_shift ? "REGIME SHIFT DETECTED" : "UNIFORM BEHAVIOUR"}
        </span>
      </div>

      {/* Rate Divergence Bar Chart */}
      <div className="rounded-2xl border border-white/5 bg-[#050505] p-5 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
        <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider mb-1">
          Stage-by-Stage Poisson Rate Parameters (λ with 95% Confidence Bounds)
        </h3>
        <p className="text-[11px] text-gray-500 font-mono mb-4">
          Non-overlapping confidence intervals formally refute the stationary Poisson process hypothesis.
        </p>

        <div className="h-60 w-full min-w-0">
          {barChartData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <ChartDefs />
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.04} />
                <XAxis dataKey="name" stroke="#555555" fontSize={10} tickLine={false} />
                <YAxis stroke="#555555" fontSize={10} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
                  content={<GlassChartTooltip unit="/ cycle" />}
                />
                <Bar dataKey="rate" fill="#8b5cf6" radius={[3, 3, 0, 0]} name="Poisson Rate λ" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Lifecycle Stage Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {stages &&
          stages.map((stage, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/5 bg-[#050505] p-5 shadow-[0_4px_25px_rgba(0,0,0,0.8)] space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h4 className="text-xs font-bold text-white font-mono">{stage.stage_name}</h4>
                <span className="text-[10px] font-mono text-gray-500">
                  Cycles {stage.start_cycle}–{stage.end_cycle}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c0c0c] border border-white/5">
                  <span className="text-gray-500">Poisson Rate (λ):</span>
                  <span className="font-bold text-cyan-400">{stage.lambda_rate.toFixed(3)}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c0c0c] border border-white/5">
                  <span className="text-gray-500">Garwood 95% CI:</span>
                  <span className="font-bold text-white">
                    [{stage.lambda_ci_95[0].toFixed(3)}, {stage.lambda_ci_95[1].toFixed(3)}]
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c0c0c] border border-white/5">
                  <span className="text-gray-500">Active Rate / Total:</span>
                  <span className="font-bold text-white">
                    {stage.percent_cycles_with_events}% ({stage.total_events} events / {stage.n_cycles} cyc)
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c0c0c] border border-white/5">
                  <span className="text-gray-500">Peak Temperature:</span>
                  <span
                    className={`font-bold ${
                      stage.max_temperature >= 40.0 ? "text-amber-400" : "text-white"
                    }`}
                  >
                    {stage.max_temperature.toFixed(2)}°C
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Scientific Caveat Footer */}
      <div className="rounded-2xl border border-white/5 bg-[#050505] p-4 text-[11px] text-gray-500 font-mono shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
        <strong>Scientific Caveat:</strong> {caveat || "Correlations with cycle number do not imply singular physical causality."}
      </div>
    </motion.div>
  );
};
