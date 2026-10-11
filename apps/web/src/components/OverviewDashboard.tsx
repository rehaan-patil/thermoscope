"use client";

import React from "react";
import { FullAnalysisResponse } from "@/types/thermoscope";
import {
  Flame,
  Activity,
  AlertTriangle,
  Clock,
  Sliders,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface OverviewDashboardProps {
  data: FullAnalysisResponse;
  setActiveTab: (tab: string) => void;
  setMode: (mode: "reading" | "episode") => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  data,
  setActiveTab,
  setMode,
}) => {
  const { poisson, exponential, decision_center, cycles, options } = data;

  const isHighRisk = decision_center.overall_classification === "HIGH RISK";
  const isWarning = decision_center.overall_classification === "WARNING";

  // Pre-sample 40 cycle data points for quick trend chart
  const sampleStep = Math.max(1, Math.floor(cycles.length / 40));
  const trendData = cycles
    .filter((_, i) => i % sampleStep === 0)
    .map((c) => ({
      cycle: c.cycle,
      maxTemp: c.max_temperature,
      events: c.event_count,
    }));

  return (
    <div className="space-y-6">
      {/* Top Banner: Mode & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-surface-border bg-surface-card p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-lg border ${
              isHighRisk
                ? "bg-red-500/10 border-red-500/30 text-risk-critical"
                : isWarning
                ? "bg-amber-500/10 border-amber-500/30 text-risk-warning"
                : "bg-emerald-500/10 border-emerald-500/30 text-risk-safe"
            }`}
          >
            {isHighRisk ? (
              <ShieldAlert className="h-6 w-6" />
            ) : isWarning ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <ShieldCheck className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-slate-400">
                Decision State:
              </span>
              <span
                className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                  isHighRisk
                    ? "bg-red-500/20 text-risk-critical border-red-500/30"
                    : isWarning
                    ? "bg-amber-500/20 text-risk-warning border-amber-500/30"
                    : "bg-emerald-500/20 text-risk-safe border-emerald-500/30"
                }`}
              >
                {decision_center.overall_classification}
              </span>
            </div>
            <p className="text-sm font-semibold text-white mt-0.5">
              NASA Cell B0005 Lifecycle Telemetry
            </p>
          </div>
        </div>

        {/* Mode Toggle & Threshold info */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex rounded-lg border border-surface-border bg-surface-elevated p-1">
            <button
              onClick={() => setMode("episode")}
              className={`px-3 py-1 text-xs font-mono rounded transition ${
                options.mode === "episode"
                  ? "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Episode Mode
            </button>
            <button
              onClick={() => setMode("reading")}
              className={`px-3 py-1 text-xs font-mono rounded transition ${
                options.mode === "reading"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Reading Mode
            </button>
          </div>

          <div className="rounded-lg border border-surface-border bg-surface-elevated px-3 py-1.5 text-xs font-mono text-slate-300">
            Threshold: <span className="font-bold text-brand-cyan">{options.threshold}°C</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimated Poisson Rate */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-5 hover:border-cyan-500/30 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>POISSON RATE (λ)</span>
            <Activity className="h-4 w-4 text-brand-cyan" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {poisson.lambda_rate.toFixed(3)}
            </span>
            <span className="text-xs text-slate-400 font-mono">events/cycle</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-500">
            95% CI: [{poisson.lambda_ci_95[0].toFixed(3)}, {poisson.lambda_ci_95[1].toFixed(3)}]
          </div>
        </div>

        {/* Index of Dispersion */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-5 hover:border-cyan-500/30 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>DISPERSION INDEX (D)</span>
            <Flame className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {poisson.dispersion_index ? poisson.dispersion_index.toFixed(2) : "N/A"}
            </span>
            <span className="text-xs text-slate-400 font-mono">s² / x̄</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-amber-400 truncate">
            {poisson.dispersion_label}
          </div>
        </div>

        {/* Waiting Time MTBE */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-5 hover:border-cyan-500/30 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>EXPECTED WAITING (E[T])</span>
            <Clock className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {exponential.expected_waiting_time > 0
                ? exponential.expected_waiting_time.toFixed(1)
                : "N/A"}
            </span>
            <span className="text-xs text-slate-400 font-mono">{exponential.time_unit}</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-500">
            CV = {exponential.coefficient_of_variation ? exponential.coefficient_of_variation.toFixed(2) : "N/A"} (Std/Mean)
          </div>
        </div>

        {/* Active Alerts */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-5 hover:border-cyan-500/30 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>ALERTS TRIGGERED</span>
            <ShieldAlert className="h-4 w-4 text-risk-warning" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {decision_center.alerts.length}
            </span>
            <span className="text-xs text-slate-400 font-mono">records</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] font-mono">
            <span className="text-risk-critical font-bold">
              {decision_center.alert_counts["HIGH RISK"]} High
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-risk-warning font-bold">
              {decision_center.alert_counts.WARNING} Warn
            </span>
          </div>
        </div>
      </div>

      {/* Mini Trend Chart & Quick Deep Dive Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cycle Thermal Trend Chart */}
        <div className="lg:col-span-2 rounded-xl border border-surface-border bg-surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                Maximum Temperature Evolution Across Observed Lifespan
              </h3>
              <p className="text-xs text-slate-400">
                168 discharge cycles with {options.threshold}°C threshold overlay
              </p>
            </div>
            <button
              onClick={() => setActiveTab("observatory")}
              className="text-xs font-mono text-brand-cyan hover:underline"
            >
              Full Observatory &rarr;
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="cycle" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[24, 44]} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d121c",
                    borderColor: "#1e293b",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="maxTemp"
                  stroke="#00e5ff"
                  strokeWidth={2}
                  dot={false}
                  name="Max Temp (°C)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Analytical Deep Dive Nav */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-white mb-3">Analytical Deep Dives</h3>

          <button
            onClick={() => setActiveTab("semantics")}
            className="w-full text-left p-3 rounded-lg border border-surface-border bg-surface-elevated hover:border-brand-cyan/40 hover:bg-surface-elevated/80 transition flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-white">Event Semantics Explorer</div>
              <div className="text-[11px] text-slate-400">Reading vs Episode comparison</div>
            </div>
            <Sliders className="h-4 w-4 text-brand-cyan" />
          </button>

          <button
            onClick={() => setActiveTab("laboratory")}
            className="w-full text-left p-3 rounded-lg border border-surface-border bg-surface-elevated hover:border-brand-cyan/40 hover:bg-surface-elevated/80 transition flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-white">Statistical Laboratory</div>
              <div className="text-[11px] text-slate-400">Observed vs Expected distributions</div>
            </div>
            <Activity className="h-4 w-4 text-purple-400" />
          </button>

          <button
            onClick={() => setActiveTab("diagnostics")}
            className="w-full text-left p-3 rounded-lg border border-surface-border bg-surface-elevated hover:border-brand-cyan/40 hover:bg-surface-elevated/80 transition flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-white">Model Adequacy Guardrail</div>
              <div className="text-[11px] text-slate-400">Dispersion & goodness-of-fit</div>
            </div>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </button>

          <button
            onClick={() => setActiveTab("decisions")}
            className="w-full text-left p-3 rounded-lg border border-surface-border bg-surface-elevated hover:border-brand-cyan/40 hover:bg-surface-elevated/80 transition flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-white">Decision Timeline</div>
              <div className="text-[11px] text-slate-400">Evidence-backed alert audit</div>
            </div>
            <ShieldAlert className="h-4 w-4 text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
