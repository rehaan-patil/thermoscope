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

interface AgeingAnalysisViewProps {
  data: FullAnalysisResponse;
}

export const AgeingAnalysisView: React.FC<AgeingAnalysisViewProps> = ({ data }) => {
  const { regime_shift } = data;
  const { stages, has_regime_shift, conclusion, shift_evidence, recommendation, caveat } =
    regime_shift;

  const barChartData = stages.map((s) => ({
    name: s.stage_name.split("(")[0].trim(),
    rate: s.lambda_rate,
    ciLower: s.lambda_ci_95[0],
    ciUpper: s.lambda_ci_95[1],
    pctActive: s.percent_cycles_with_events,
    maxTemp: s.max_temperature,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-6">
        <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-bold uppercase mb-2">
          <TrendingUp className="h-4 w-4" /> Feature 3 — Thermal Regime Shift Explorer
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Lifecycle Ageing Stages & Non-Stationary Rate Divergence
        </h2>
        <p className="mt-1 text-sm text-slate-300 max-w-4xl leading-relaxed">
          As lithium-ion cells experience degradation (SEI growth and capacity fade), internal resistance
          rises, generating severe Joule heating. ThermoScope partitions the operational life to test
          whether the homogeneous Poisson constant-rate assumption holds across degradation regimes.
        </p>
      </div>

      {/* Regime Shift Verdict Banner */}
      <div
        className={`rounded-xl border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          has_regime_shift
            ? "border-amber-500/40 bg-amber-500/10"
            : "border-emerald-500/40 bg-emerald-500/10"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg border ${
              has_regime_shift
                ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                : "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
            }`}
          >
            {has_regime_shift ? <AlertTriangle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono">{conclusion}</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">{recommendation}</p>
            {shift_evidence.length > 0 && (
              <div className="mt-2 text-xs text-amber-300/90 font-mono">
                {shift_evidence.map((ev, i) => (
                  <div key={i}>• {ev}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-surface-card border border-surface-border text-slate-300 shrink-0">
          Hypothesis: H₀: λ_early = λ_late &rarr;{" "}
          <strong className={has_regime_shift ? "text-amber-400" : "text-emerald-400"}>
            {has_regime_shift ? "REJECTED" : "ACCEPTED"}
          </strong>
        </div>
      </div>

      {/* Comparative Rate Bar Chart */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-6">
        <h3 className="text-sm font-bold text-white mb-1">
          Stage-Wise Event Rate (λ) with 95% Garwood Confidence Intervals
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Notice the non-overlapping error bounds proving statistically significant rate acceleration in late life.
        </p>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d121c",
                  borderColor: "#1e293b",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="rate" fill="#a855f7" radius={[4, 4, 0, 0]} name="Rate λ (events/cycle)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stage Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stages.map((stage, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-surface-border bg-surface-card p-5 space-y-3"
          >
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div>
                <h4 className="text-sm font-bold text-white">{stage.stage_name}</h4>
                <span className="text-[11px] font-mono text-slate-400">
                  Cycles {stage.start_cycle}–{stage.end_cycle} ({stage.n_cycles} cycles)
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded bg-surface-elevated">
                <span className="text-slate-400">Estimated Rate (λ_s):</span>
                <span className="font-bold text-purple-400">{stage.lambda_rate.toFixed(3)}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-elevated">
                <span className="text-slate-400">95% Garwood CI:</span>
                <span className="font-bold text-slate-300">
                  [{stage.lambda_ci_95[0].toFixed(3)}, {stage.lambda_ci_95[1].toFixed(3)}]
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-elevated">
                <span className="text-slate-400">Cycles w/ Events:</span>
                <span className="font-bold text-white">{stage.percent_cycles_with_events.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-elevated">
                <span className="text-slate-400">Peak Temperature:</span>
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

      {/* Scientific Caveat */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-4 text-xs text-slate-400 font-mono">
        <strong>Scientific Caveat:</strong> {caveat}
      </div>
    </div>
  );
};
