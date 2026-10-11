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
  const { threshold_sensitivity } = data;
  const { points, narrative, disclaimer } = threshold_sensitivity;

  const chartData = points.map((p) => ({
    threshold: `${p.threshold_c}°C`,
    thVal: p.threshold_c,
    rate: p.lambda_rate,
    totalEvents: p.total_events,
    dispersion: p.dispersion_index ?? 1.0,
    activeCycles: p.cycles_with_events,
  }));

  const activePoint =
    points.find((p) => Math.abs(p.threshold_c - currentThreshold) < 0.1) || points[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-6">
        <div className="flex items-center gap-2 text-brand-cyan text-xs font-mono font-bold uppercase mb-2">
          <Sliders className="h-4 w-4" /> Feature 4 — Threshold Sensitivity Studio
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Analytical Threshold Continuum Response
        </h2>
        <p className="mt-1 text-sm text-slate-300 max-w-4xl leading-relaxed">
          Evaluating how varying the project temperature threshold (36.0°C to 45.0°C) shifts
          event counts, Poisson rate parameters, and downstream alert sensitivities.
        </p>
      </div>

      {/* Threshold Selector Strip */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-5">
        <label className="text-xs font-mono text-slate-400 block mb-3">
          Select Analytical Scenario Threshold:
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {points.map((p) => {
            const isSelected = Math.abs(p.threshold_c - currentThreshold) < 0.1;
            return (
              <button
                key={p.threshold_c}
                onClick={() => onSelectThreshold(p.threshold_c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  isSelected
                    ? "bg-brand-cyan text-slate-950 shadow-md ring-2 ring-cyan-400"
                    : "bg-surface-elevated text-slate-300 hover:text-white hover:bg-surface-border"
                }`}
              >
                {p.threshold_c.toFixed(1)}°C
              </button>
            );
          })}
        </div>
      </div>

      {/* Sensitivity Curves Plot */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Event Rate Response vs. Temperature Threshold</h3>
            <p className="text-xs text-slate-400">
              Parametric response demonstrates how conclusions depend on threshold selection.
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="threshold" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" stroke="#00e5ff" fontSize={11} tickLine={false} />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#f59e0b"
                fontSize={11}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d121c",
                  borderColor: "#1e293b",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="rate"
                stroke="#00e5ff"
                strokeWidth={2}
                name="Poisson Rate λ (events/cycle)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="totalEvents"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Total Observed Events"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Narrative & Active Scenario Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-surface-border bg-surface-card p-5 space-y-3">
          <h4 className="text-xs font-mono uppercase text-slate-400 font-bold">
            Sensitivity Synthesis
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{narrative}</p>
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono uppercase text-slate-400 font-bold">
              Active Scenario: {activePoint.threshold_c.toFixed(1)}°C
            </h4>
            <span className="text-xs font-mono text-brand-cyan font-bold">
              {activePoint.total_events} Total Events
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded bg-surface-elevated">
              <span className="text-slate-400">Estimated Rate:</span>
              <span className="font-bold text-white">{activePoint.lambda_rate.toFixed(3)} / cycle</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-elevated">
              <span className="text-slate-400">Active Cycles:</span>
              <span className="font-bold text-white">
                {activePoint.cycles_with_events} ({activePoint.percent_cycles_with_events}%)
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-elevated">
              <span className="text-slate-400">Waiting Intervals:</span>
              <span className="font-bold text-white">{activePoint.n_waiting_intervals}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytical Disclaimer */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-4 text-xs text-slate-400 font-mono">
        <strong>Disclaimer:</strong> {disclaimer}
      </div>
    </div>
  );
};
