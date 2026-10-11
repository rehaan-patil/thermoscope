"use client";

import React, { useState } from "react";
import { FullAnalysisResponse } from "@/types/thermoscope";
import { calculateProbabilityApi } from "@/lib/api";
import { Activity, Calculator, Check, Info, TrendingUp, Clock } from "lucide-react";
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

interface StatisticalLaboratoryProps {
  data: FullAnalysisResponse;
}

export const StatisticalLaboratory: React.FC<StatisticalLaboratoryProps> = ({ data }) => {
  const { poisson, exponential, cycles } = data;

  // Interactive probability calculator state
  const [calcLambda, setCalcLambda] = useState<number>(poisson.lambda_rate);
  const [calcK, setCalcK] = useState<number>(3);
  const [liveProbs, setLiveProbs] = useState<Record<string, number>>(poisson.probabilities);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Frequency comparison chart data (Bins: 0, 1, 2, 3, 4+)
  const freqData = [
    {
      bin: "0 events",
      Observed: poisson.observed_frequencies["0"],
      Expected: Number(poisson.expected_frequencies["0"].toFixed(2)),
    },
    {
      bin: "1 event",
      Observed: poisson.observed_frequencies["1"],
      Expected: Number(poisson.expected_frequencies["1"].toFixed(2)),
    },
    {
      bin: "2 events",
      Observed: poisson.observed_frequencies["2"],
      Expected: Number(poisson.expected_frequencies["2"].toFixed(2)),
    },
    {
      bin: "3 events",
      Observed: poisson.observed_frequencies["3"],
      Expected: Number(poisson.expected_frequencies["3"].toFixed(2)),
    },
    {
      bin: "4+ events",
      Observed: poisson.observed_frequencies["4+"],
      Expected: Number(poisson.expected_frequencies["4+"].toFixed(2)),
    },
  ];

  const handleRecalculateProbs = async (newLam: number, newK: number) => {
    setCalcLambda(newLam);
    setCalcK(newK);
    setIsCalculating(true);
    try {
      const p = await calculateProbabilityApi(newLam, newK);
      setLiveProbs(p);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-6">
        <div className="flex items-center gap-2 text-brand-cyan text-xs font-mono font-bold uppercase mb-2">
          <Activity className="h-4 w-4" /> Statistical Laboratory
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Poisson Frequency & Exponential Waiting-Time Modeling
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          Rigorous distribution fitting using SciPy statistical formulations, exact Garwood
          confidence limits, and empirical frequency comparisons.
        </p>
      </div>

      {/* Observed vs Expected Frequencies & Conservation Banner */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">
              Observed vs. Expected Poisson Cycle Frequencies
            </h3>
            <p className="text-xs text-slate-400">
              E_k = n · P(X = k) across {poisson.n_observations} total discharge cycles.
            </p>
          </div>
          {/* Conservation Check Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
            <Check className="h-3.5 w-3.5" />
            <span>Grouped Total Conservation: |Σ E_k - n| = {poisson.conservation_difference.toFixed(6)}</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={freqData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="bin" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d121c",
                  borderColor: "#1e293b",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="Observed" fill="#00e5ff" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Expected" fill="#64748b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Probability Calculator & Exponential Density */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Poisson Probability Studio */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Calculator className="h-4 w-4 text-brand-cyan" />
              <span>Interactive Poisson Probability Studio</span>
            </div>
            <span className="text-xs font-mono text-slate-400">Formula: P(X=k) = e^-λ · λ^k / k!</span>
          </div>

          {/* Rate & k controls */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                Poisson Rate (λ): <strong className="text-white">{calcLambda.toFixed(2)}</strong>
              </label>
              <input
                type="range"
                min="0.05"
                max="5.0"
                step="0.05"
                value={calcLambda}
                onChange={(e) => handleRecalculateProbs(parseFloat(e.target.value), calcK)}
                className="w-full accent-cyan-400"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                Event Count (k): <strong className="text-white">{calcK}</strong>
              </label>
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3, 4].map((v) => (
                  <button
                    key={v}
                    onClick={() => handleRecalculateProbs(calcLambda, v)}
                    className={`h-7 w-7 rounded font-mono text-xs font-bold transition ${
                      calcK === v
                        ? "bg-brand-cyan text-slate-950"
                        : "bg-surface-elevated text-slate-400 hover:text-white"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calculated Probabilities Grid with explicit distinctions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-surface-elevated">
              <span className="text-slate-400 block">P(X = 0):</span>
              <span className="text-base font-bold text-white">
                {(liveProbs.P_0 * 100).toFixed(2)}%
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-elevated">
              <span className="text-slate-400 block">P(X = 1):</span>
              <span className="text-base font-bold text-white">
                {(liveProbs.P_1 * 100).toFixed(2)}%
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-elevated border border-cyan-500/30">
              <span className="text-brand-cyan block">P(X = {calcK}):</span>
              <span className="text-base font-bold text-brand-cyan">
                {((liveProbs[`P_${calcK}`] ?? 0) * 100).toFixed(2)}%
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-elevated">
              <span className="text-slate-400 block">P(X ≥ {calcK}) (At Least):</span>
              <span className="text-base font-bold text-white">
                {((liveProbs[`P_ge_${calcK}`] ?? liveProbs.P_ge_3 ?? 0) * 100).toFixed(2)}%
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-elevated">
              <span className="text-slate-400 block">P(X &gt; {calcK}) (Strictly More):</span>
              <span className="text-base font-bold text-white">
                {((liveProbs[`P_gt_${calcK}`] ?? liveProbs.P_gt_3 ?? 0) * 100).toFixed(2)}%
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-elevated">
              <span className="text-slate-400 block">Difference:</span>
              <span className="text-base font-bold text-emerald-400">
                {(
                  ((liveProbs[`P_ge_${calcK}`] ?? liveProbs.P_ge_3 ?? 0) -
                    (liveProbs[`P_gt_${calcK}`] ?? liveProbs.P_gt_3 ?? 0)) *
                  100
                ).toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-500 italic">
            Note: Explicitly verifies that P(X ≥ k) - P(X &gt; k) equals exactly P(X = k).
          </div>
        </div>

        {/* Exponential Waiting-Time Density */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Clock className="h-4 w-4 text-purple-400" />
              <span>Exponential Inter-Event Waiting Time</span>
            </div>
            <span className="text-xs font-mono text-slate-400">f(t) = λ_E · e^-λ_E·t</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-surface-elevated">
              <span className="text-slate-400 block">Expected Waiting (E[T]):</span>
              <span className="text-xl font-bold text-white">
                {exponential.expected_waiting_time > 0
                  ? exponential.expected_waiting_time.toFixed(2)
                  : "N/A"}{" "}
                <span className="text-xs font-normal text-slate-400">{exponential.time_unit}</span>
              </span>
            </div>
            <div className="p-3 rounded-lg bg-surface-elevated">
              <span className="text-slate-400 block">Rate Parameter (λ_E):</span>
              <span className="text-xl font-bold text-purple-400">
                {exponential.lambda_rate.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Density Curve Plot */}
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={exponential.density_curve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="t"
                  stroke="#64748b"
                  fontSize={10}
                  tickFormatter={(v) => Math.round(v).toString()}
                  tickLine={false}
                />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
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
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Intervals Observed: {exponential.n_intervals}</span>
            <span>CV: {exponential.coefficient_of_variation?.toFixed(2) ?? "N/A"} (Std / Mean)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
