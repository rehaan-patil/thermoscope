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
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { ChartDefs, GlassChartTooltip } from "./ChartPrimitives";
import { motion } from "framer-motion";

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
  if (!data) return null;

  const { poisson, exponential, decision_center, cycles, options } = data;

  const isHighRisk = decision_center?.overall_classification === "HIGH RISK";
  const isWarning = decision_center?.overall_classification === "WARNING";
  const threshold = options?.threshold || 40.0;

  // Pre-sample 40 cycle data points for clean, fast trend visualization
  const sampleStep = cycles && cycles.length > 0 ? Math.max(1, Math.floor(cycles.length / 40)) : 1;
  const trendData = cycles
    ? cycles
        .filter((_, i) => i % sampleStep === 0)
        .map((c) => ({
          cycle: c.cycle,
          maxTemp: Number(c.max_temperature.toFixed(2)),
          events: c.event_count,
        }))
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      {/* Top Banner: Blackbox.ai System Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#080808]/90 backdrop-blur-xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-3.5">
          <div
            className={`p-3 rounded-2xl border transition shadow-sm ${
              isHighRisk
                ? "bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                : isWarning
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            }`}
          >
            {isHighRisk ? (
              <ShieldAlert className="h-5 w-5" />
            ) : isWarning ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <ShieldCheck className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold">
                Classification Status
              </span>
              <span
                className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md border ${
                  isHighRisk
                    ? "bg-red-500/15 text-red-400 border-red-500/30"
                    : isWarning
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                }`}
              >
                {decision_center?.overall_classification || "SAFE"}
              </span>
            </div>
            <p className="text-sm font-semibold text-white mt-1 font-mono tracking-tight">
              NASA Ames Cell B0005 Lifecycle Telemetry • 168 Discharge Cycles
            </p>
          </div>
        </div>

        {/* Mode Toggle & Threshold info */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex rounded-xl border border-white/5 bg-[#0e0e0e] p-1">
            <button
              onClick={() => setMode("episode")}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition ${
                options?.mode === "episode"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Episode
            </button>
            <button
              onClick={() => setMode("reading")}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition ${
                options?.mode === "reading"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Reading
            </button>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#0e0e0e] px-3.5 py-1.5 text-xs font-mono text-gray-300">
            θ: <span className="font-bold text-cyan-400">{threshold.toFixed(1)}°C</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid - Monospace Metrics with Apple-grade micro-glows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Estimated Poisson Rate */}
        <div className="group rounded-2xl border border-white/5 bg-[#050505] p-4.5 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(0,229,255,0.08)] transition duration-200">
          <div className="flex items-center justify-between text-gray-500 text-[11px] font-mono">
            <span>POISSON RATE (λ)</span>
            <Activity className="h-3.5 w-3.5 text-cyan-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {poisson?.lambda_rate?.toFixed(3) || "0.000"}
            </span>
            <span className="text-xs text-gray-500 font-mono">events/cycle</span>
          </div>
          <div className="mt-2 text-[10px] font-mono text-gray-500">
            Garwood 95% CI: [{poisson?.lambda_ci_95?.[0]?.toFixed(3) || "0.000"},{" "}
            {poisson?.lambda_ci_95?.[1]?.toFixed(3) || "0.000"}]
          </div>
        </div>

        {/* Index of Dispersion */}
        <div className="group rounded-2xl border border-white/5 bg-[#050505] p-4.5 hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.08)] transition duration-200">
          <div className="flex items-center justify-between text-gray-500 text-[11px] font-mono">
            <span>DISPERSION INDEX (D)</span>
            <Flame className="h-3.5 w-3.5 text-amber-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {poisson?.dispersion_index ? poisson.dispersion_index.toFixed(2) : "N/A"}
            </span>
            <span className="text-xs text-gray-500 font-mono">s² / x̄</span>
          </div>
          <div className="mt-2 text-[10px] font-mono text-amber-400 truncate font-semibold">
            {poisson?.dispersion_label || "Equidispersed"}
          </div>
        </div>

        {/* Waiting Time MTBE */}
        <div className="group rounded-2xl border border-white/5 bg-[#050505] p-4.5 hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.08)] transition duration-200">
          <div className="flex items-center justify-between text-gray-500 text-[11px] font-mono">
            <span>EXP. WAITING E[T]</span>
            <Clock className="h-3.5 w-3.5 text-purple-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {exponential?.expected_waiting_time > 0
                ? exponential.expected_waiting_time.toFixed(1)
                : "N/A"}
            </span>
            <span className="text-xs text-gray-500 font-mono">{exponential?.time_unit || "cycles"}</span>
          </div>
          <div className="mt-2 text-[10px] font-mono text-gray-500">
            CV = {exponential?.coefficient_of_variation ? exponential.coefficient_of_variation.toFixed(2) : "N/A"} (Std/Mean)
          </div>
        </div>

        {/* Active Alerts */}
        <div className="group rounded-2xl border border-white/5 bg-[#050505] p-4.5 hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.08)] transition duration-200">
          <div className="flex items-center justify-between text-gray-500 text-[11px] font-mono">
            <span>ACTIVE ALERTS</span>
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {decision_center?.alerts?.length || 0}
            </span>
            <span className="text-xs text-gray-500 font-mono">triggered</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[10px] font-mono">
            <span className="text-red-400 font-bold">
              {decision_center?.alert_counts?.["HIGH RISK"] || 0} Critical
            </span>
            <span className="text-gray-700">•</span>
            <span className="text-amber-400 font-bold">
              {decision_center?.alert_counts?.WARNING || 0} Warnings
            </span>
          </div>
        </div>
      </div>

      {/* Mini Trend Chart & Quick Deep Dive Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cycle Thermal Trend Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#050505] p-5 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Max Temperature Evolution Across Observed Lifespan
              </h3>
              <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                168 discharge cycles with {threshold.toFixed(1)}°C threshold overlay
              </p>
            </div>
            <button
              onClick={() => setActiveTab("observatory")}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
            >
              <span>Full Observatory</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-60 w-full min-w-0">
            {trendData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <ChartDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.04} />
                  <XAxis dataKey="cycle" stroke="#555555" fontSize={10} tickLine={false} />
                  <YAxis domain={[24, 44]} stroke="#555555" fontSize={10} tickLine={false} />
                  <Tooltip
                    cursor={{ stroke: "#00e5ff", strokeWidth: 1, strokeDasharray: "3 3", strokeOpacity: 0.6 }}
                    content={<GlassChartTooltip threshold={threshold} unit="°C" />}
                  />
                  <ReferenceLine y={threshold} stroke="#f59e0b" strokeDasharray="4 4" />
                  <Area
                    type="monotone"
                    dataKey="maxTemp"
                    stroke="url(#neonBlueCyan)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#glowAreaBlue)"
                    name="Max Temperature"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Analytical Deep Dive Nav */}
        <div className="rounded-2xl border border-white/5 bg-[#050505] p-4.5 space-y-2.5 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
          <h3 className="text-xs font-bold text-gray-400 font-mono uppercase tracking-wider mb-2">
            Analytical Modules
          </h3>

          <button
            onClick={() => setActiveTab("semantics")}
            className="w-full text-left p-3 rounded-xl border border-white/5 bg-[#0a0a0a] hover:border-cyan-500/30 hover:bg-[#0f0f0f] transition flex items-center justify-between group"
          >
            <div>
              <div className="text-xs font-bold text-white font-mono group-hover:text-cyan-400 transition">
                Event Semantics
              </div>
              <div className="text-[10px] text-gray-500">Reading vs Episode comparison</div>
            </div>
            <Sliders className="h-3.5 w-3.5 text-gray-500 group-hover:text-cyan-400 transition" />
          </button>

          <button
            onClick={() => setActiveTab("laboratory")}
            className="w-full text-left p-3 rounded-xl border border-white/5 bg-[#0a0a0a] hover:border-purple-500/30 hover:bg-[#0f0f0f] transition flex items-center justify-between group"
          >
            <div>
              <div className="text-xs font-bold text-white font-mono group-hover:text-purple-400 transition">
                Statistical Laboratory
              </div>
              <div className="text-[10px] text-gray-500">Observed vs Expected distributions</div>
            </div>
            <Activity className="h-3.5 w-3.5 text-gray-500 group-hover:text-purple-400 transition" />
          </button>

          <button
            onClick={() => setActiveTab("ageing")}
            className="w-full text-left p-3 rounded-xl border border-white/5 bg-[#0a0a0a] hover:border-amber-500/30 hover:bg-[#0f0f0f] transition flex items-center justify-between group"
          >
            <div>
              <div className="text-xs font-bold text-white font-mono group-hover:text-amber-400 transition">
                Regime Shift Analysis
              </div>
              <div className="text-[10px] text-gray-500">Lifecycle non-stationary divergence</div>
            </div>
            <TrendingUp className="h-3.5 w-3.5 text-gray-500 group-hover:text-amber-400 transition" />
          </button>

          <button
            onClick={() => setActiveTab("decisions")}
            className="w-full text-left p-3 rounded-xl border border-white/5 bg-[#0a0a0a] hover:border-red-500/30 hover:bg-[#0f0f0f] transition flex items-center justify-between group"
          >
            <div>
              <div className="text-xs font-bold text-white font-mono group-hover:text-red-400 transition">
                Decision Timeline
              </div>
              <div className="text-[10px] text-gray-500">Evidence-backed alert audit</div>
            </div>
            <ShieldAlert className="h-3.5 w-3.5 text-gray-500 group-hover:text-red-400 transition" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
