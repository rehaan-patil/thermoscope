"use client";

import React, { useState } from "react";
import { FullAnalysisResponse } from "@/types/thermoscope";
import { calculateProbabilityApi } from "@/lib/api";
import { Activity, Calculator, Check, Clock, Sparkles } from "lucide-react";
import {
  BarChart,
  Bar,
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

interface StatisticalLaboratoryProps {
  data: FullAnalysisResponse;
}

export const StatisticalLaboratory: React.FC<StatisticalLaboratoryProps> = ({ data }) => {
  // Interactive probability calculator state
  const [calcLambda, setCalcLambda] = useState<number>(data?.poisson?.lambda_rate || 0.51);
  const [calcK, setCalcK] = useState<number>(3);
  const [liveProbs, setLiveProbs] = useState<Record<string, number>>(
    data?.poisson?.probabilities || { P_0: 0.6, P_1: 0.3 }
  );

  if (!data) return null;

  const { poisson, exponential } = data;

  // Frequency comparison chart data (Bins: 0, 1, 2, 3, 4+)
  const freqData = poisson?.observed_frequencies
    ? [
        {
          bin: "0 events",
          Observed: poisson.observed_frequencies["0"] || 0,
          Expected: Number((poisson.expected_frequencies?.["0"] || 0).toFixed(2)),
        },
        {
          bin: "1 event",
          Observed: poisson.observed_frequencies["1"] || 0,
          Expected: Number((poisson.expected_frequencies?.["1"] || 0).toFixed(2)),
        },
        {
          bin: "2 events",
          Observed: poisson.observed_frequencies["2"] || 0,
          Expected: Number((poisson.expected_frequencies?.["2"] || 0).toFixed(2)),
        },
        {
          bin: "3 events",
          Observed: poisson.observed_frequencies["3"] || 0,
          Expected: Number((poisson.expected_frequencies?.["3"] || 0).toFixed(2)),
        },
        {
          bin: "4+ events",
          Observed: poisson.observed_frequencies["4+"] || 0,
          Expected: Number((poisson.expected_frequencies?.["4+"] || 0).toFixed(2)),
        },
      ]
    : [];

  const handleRecalculateProbs = async (newLam: number, newK: number) => {
    setCalcLambda(newLam);
    setCalcK(newK);
    try {
      const p = await calculateProbabilityApi(newLam, newK);
      setLiveProbs(p);
    } catch (e) {
      console.error(e);
    }
  };

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
          <Activity className="h-4 w-4" /> Statistical Laboratory
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono">
          Poisson Frequency & Exponential Waiting-Time Modeling
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-400 font-mono">
          Rigorous distribution fitting using SciPy statistical formulations, exact Garwood
          confidence limits, and empirical frequency comparisons.
        </p>
      </div>

      {/* Observed vs Expected Frequencies & Conservation Banner */}
      <div className="rounded-2xl border border-white/5 bg-[#050505] p-5 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Observed vs. Expected Poisson Cycle Frequencies
            </h3>
            <p className="text-[11px] text-gray-500 font-mono mt-0.5">
              E_k = n · P(X = k) across {poisson?.n_observations || 168} total discharge cycles.
            </p>
          </div>
          {/* Conservation Check Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-emerald-400 text-xs font-mono shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <Check className="h-3.5 w-3.5" />
            <span>Grouped Conservation: |Σ E_k - n| = {poisson?.conservation_difference?.toFixed(6) || "0.000000"}</span>
          </div>
        </div>

        <div className="h-64 w-full min-w-0">
          {freqData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={freqData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.04} />
                <XAxis dataKey="bin" stroke="#555555" fontSize={10} tickLine={false} />
                <YAxis stroke="#555555" fontSize={10} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
                  content={<GlassChartTooltip unit="cycles" />}
                />
                <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace" }} />
                <Bar dataKey="Observed" fill="#00e5ff" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Expected" fill="#6366f1" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Interactive Probability Calculator & Exponential Density */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Interactive Poisson Probability Studio */}
        <div className="rounded-2xl border border-white/5 bg-[#050505] p-5 shadow-[0_4px_25px_rgba(0,0,0,0.8)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-white font-bold text-xs font-mono">
              <Calculator className="h-4 w-4 text-cyan-400" />
              <span>Interactive Poisson Probability Studio</span>
            </div>
            <span className="text-[10px] font-mono text-gray-500">P(X=k) = e^-λ · λ^k / k!</span>
          </div>

          {/* Rate & k controls */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1">
                Poisson Rate (λ): <strong className="text-white">{calcLambda.toFixed(2)}</strong>
              </label>
              <input
                type="range"
                min="0.05"
                max="5.0"
                step="0.05"
                value={calcLambda}
                onChange={(e) => handleRecalculateProbs(parseFloat(e.target.value), calcK)}
                className="w-full accent-cyan-400 h-1.5 bg-[#222222] rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1">
                Event Count (k): <strong className="text-white">{calcK}</strong>
              </label>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3, 4].map((v) => (
                  <button
                    key={v}
                    onClick={() => handleRecalculateProbs(calcLambda, v)}
                    className={`h-7 w-7 rounded-lg font-mono text-xs font-bold transition ${
                      calcK === v
                        ? "bg-cyan-400 text-black shadow-md shadow-cyan-500/20"
                        : "bg-[#111111] text-gray-400 hover:text-white"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calculated Probabilities Grid with explicit distinctions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#0c0c0c] border border-white/5">
              <span className="text-gray-500 block text-[10px]">P(X = 0):</span>
              <span className="text-sm font-bold text-white">
                {((liveProbs?.P_0 || 0) * 100).toFixed(2)}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c0c0c] border border-white/5">
              <span className="text-gray-500 block text-[10px]">P(X = 1):</span>
              <span className="text-sm font-bold text-white">
                {((liveProbs?.P_1 || 0) * 100).toFixed(2)}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c0c0c] border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.08)]">
              <span className="text-cyan-400 block text-[10px]">P(X = {calcK}):</span>
              <span className="text-sm font-bold text-cyan-400">
                {(((liveProbs?.[`P_${calcK}`] ?? 0)) * 100).toFixed(2)}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c0c0c] border border-white/5">
              <span className="text-gray-500 block text-[10px]">P(X ≥ {calcK}) (At Least):</span>
              <span className="text-sm font-bold text-white">
                {(((liveProbs?.[`P_ge_${calcK}`] ?? liveProbs?.P_ge_3 ?? 0)) * 100).toFixed(2)}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c0c0c] border border-white/5">
              <span className="text-gray-500 block text-[10px]">P(X &gt; {calcK}) (Strictly More):</span>
              <span className="text-sm font-bold text-white">
                {(((liveProbs?.[`P_gt_${calcK}`] ?? liveProbs?.P_gt_3 ?? 0)) * 100).toFixed(2)}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c0c0c] border border-white/5">
              <span className="text-gray-500 block text-[10px]">Difference:</span>
              <span className="text-sm font-bold text-emerald-400">
                {(
                  (((liveProbs?.[`P_ge_${calcK}`] ?? liveProbs?.P_ge_3 ?? 0) -
                    (liveProbs?.[`P_gt_${calcK}`] ?? liveProbs?.P_gt_3 ?? 0)) *
                  100)
                ).toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-gray-500 italic flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>Exact identity: P(X ≥ k) - P(X &gt; k) equals precisely P(X = k).</span>
          </div>
        </div>

        {/* Exponential Waiting-Time Density */}
        <div className="rounded-2xl border border-white/5 bg-[#050505] p-5 shadow-[0_4px_25px_rgba(0,0,0,0.8)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-white font-bold text-xs font-mono">
              <Clock className="h-4 w-4 text-purple-400" />
              <span>Exponential Inter-Event Waiting Time</span>
            </div>
            <span className="text-[10px] font-mono text-gray-500">f(t) = λ_E · e^-λ_E·t</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#0c0c0c] border border-white/5">
              <span className="text-gray-500 block text-[10px]">Expected Waiting (E[T]):</span>
              <span className="text-lg font-bold text-white">
                {exponential?.expected_waiting_time > 0
                  ? exponential.expected_waiting_time.toFixed(2)
                  : "N/A"}{" "}
                <span className="text-[11px] font-normal text-gray-500">{exponential?.time_unit || "cycles"}</span>
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c0c0c] border border-white/5">
              <span className="text-gray-500 block text-[10px]">Rate Parameter (λ_E):</span>
              <span className="text-lg font-bold text-purple-400">
                {exponential?.lambda_rate?.toFixed(4) || "0.0000"}
              </span>
            </div>
          </div>

          {/* Density Curve Plot */}
          <div className="h-44 w-full min-w-0">
            {exponential?.density_curve && exponential.density_curve.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={exponential.density_curve}>
                  <ChartDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.04} />
                  <XAxis
                    dataKey="t"
                    stroke="#555555"
                    fontSize={10}
                    tickFormatter={(v) => Math.round(v).toString()}
                    tickLine={false}
                  />
                  <YAxis stroke="#555555" fontSize={10} tickLine={false} />
                  <Tooltip
                    cursor={{ stroke: "#8b5cf6", strokeWidth: 1, strokeDasharray: "3 3", strokeOpacity: 0.6 }}
                    content={<GlassChartTooltip unit="" />}
                  />
                  <Line
                    type="monotone"
                    dataKey="pdf"
                    stroke="#c084fc"
                    strokeWidth={2}
                    dot={false}
                    name="Density f(t)"
                  />
                  <Line
                    type="monotone"
                    dataKey="survival"
                    stroke="#38bdf8"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Survival P(T > t)"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="text-[10px] font-mono text-gray-500 flex items-center justify-between">
            <span>Intervals Observed: {exponential?.n_intervals || 0}</span>
            <span>CV: {exponential?.coefficient_of_variation?.toFixed(2) ?? "N/A"} (Std / Mean)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
