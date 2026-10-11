"use client";

import React from "react";
import { FullAnalysisResponse } from "@/types/thermoscope";
import { Shield } from "lucide-react";

interface ModelAdequacyGuardrailProps {
  data: FullAnalysisResponse;
}

export const ModelAdequacyGuardrail: React.FC<ModelAdequacyGuardrailProps> = ({ data }) => {
  const { poisson, exponential } = data;

  const isPoissonSupported = poisson.adequacy_status.includes("Supported");
  const isPoissonCaution = poisson.adequacy_status.includes("Caution");

  const isExponSupported = exponential.adequacy_status.includes("Supported");
  const isExponCaution = exponential.adequacy_status.includes("Caution");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-6">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase mb-2">
          <Shield className="h-4 w-4" /> Feature 2 — Model Adequacy Guardrail
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Statistical Model Suitability & Diagnostic Audit
        </h2>
        <p className="mt-1 text-sm text-slate-300 max-w-4xl leading-relaxed">
          ThermoScope evaluates whether mathematical point-process assumptions hold before
          relying on derived probabilities. If empirical dispersion or aging trends violate theoretical
          assumptions, clear rule-based cautions are generated.
        </p>
      </div>

      {/* Main Guardrail Cards: Poisson vs Exponential */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Poisson Model Diagnostic Card */}
        <div className="rounded-2xl border border-surface-border bg-surface-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-surface-border">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">Model Evaluation</span>
                <h3 className="text-base font-bold text-white">Poisson Process Adequacy</h3>
              </div>
              <span
                className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                  isPoissonSupported
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : isPoissonCaution
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-slate-500/10 text-slate-400 border-slate-500/30"
                }`}
              >
                {poisson.adequacy_status}
              </span>
            </div>

            {/* Diagnostic Metrics Table */}
            <div className="mt-4 space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-elevated">
                <span className="text-slate-400">Sample Mean (x̄):</span>
                <span className="font-bold text-white">{poisson.mean.toFixed(3)}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-elevated">
                <span className="text-slate-400">Sample Variance (s²):</span>
                <span className="font-bold text-white">{poisson.variance.toFixed(3)}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-elevated">
                <span className="text-slate-400">Dispersion Index (D = s²/x̄):</span>
                <span
                  className={`font-bold ${
                    poisson.dispersion_index && poisson.dispersion_index > 1.3
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {poisson.dispersion_index ? poisson.dispersion_index.toFixed(2) : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-elevated">
                <span className="text-slate-400">Chi-Square GoF Test:</span>
                <span className="font-bold text-slate-300">
                  {poisson.chi_square_stat
                    ? `χ² = ${poisson.chi_square_stat.toFixed(2)} (df=${poisson.chi_square_df}, p=${poisson.chi_square_p_value?.toFixed(3)})`
                    : "Pooled N/A (Low expected counts)"}
                </span>
              </div>
            </div>

            {/* Rationale explanation */}
            <div className="mt-4 p-3 rounded-lg bg-surface-elevated/80 border border-surface-border text-xs text-slate-300 leading-relaxed">
              <p className="font-semibold text-slate-200 mb-1">Diagnostic Rationale:</p>
              {poisson.adequacy_rationale}
            </div>
          </div>

          {/* Model Limitations Checklist */}
          <div className="mt-4 pt-3 border-t border-surface-border">
            <h4 className="text-[11px] font-mono uppercase text-slate-400 font-bold mb-1.5">
              Documented Poisson Limitations:
            </h4>
            <ul className="space-y-1 text-xs text-slate-400">
              {poisson.limitations.map((lim, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-brand-cyan">•</span>
                  <span>{lim}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Exponential Model Diagnostic Card */}
        <div className="rounded-2xl border border-surface-border bg-surface-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-surface-border">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">Model Evaluation</span>
                <h3 className="text-base font-bold text-white">Exponential Waiting-Time Adequacy</h3>
              </div>
              <span
                className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                  isExponSupported
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : isExponCaution
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-slate-500/10 text-slate-400 border-slate-500/30"
                }`}
              >
                {exponential.adequacy_status}
              </span>
            </div>

            {/* Diagnostic Metrics Table */}
            <div className="mt-4 space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-elevated">
                <span className="text-slate-400">Mean Waiting Time (x̄_T):</span>
                <span className="font-bold text-white">
                  {exponential.mean_waiting_time.toFixed(2)} {exponential.time_unit}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-elevated">
                <span className="text-slate-400">Standard Deviation (s_T):</span>
                <span className="font-bold text-white">
                  {exponential.std_waiting_time.toFixed(2)} {exponential.time_unit}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-elevated">
                <span className="text-slate-400">Coefficient of Variation (CV = s_T/x̄_T):</span>
                <span
                  className={`font-bold ${
                    exponential.coefficient_of_variation &&
                    (exponential.coefficient_of_variation > 1.25 ||
                      exponential.coefficient_of_variation < 0.8)
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {exponential.coefficient_of_variation
                    ? exponential.coefficient_of_variation.toFixed(2)
                    : "N/A"}{" "}
                  <span className="text-[10px] text-slate-400">(Ideal = 1.0)</span>
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-elevated">
                <span className="text-slate-400">Observed Intervals (k):</span>
                <span className="font-bold text-white">{exponential.n_intervals}</span>
              </div>
            </div>

            {/* Rationale explanation */}
            <div className="mt-4 p-3 rounded-lg bg-surface-elevated/80 border border-surface-border text-xs text-slate-300 leading-relaxed">
              <p className="font-semibold text-slate-200 mb-1">Diagnostic Rationale:</p>
              {exponential.adequacy_rationale}
            </div>
          </div>

          {/* Model Limitations Checklist */}
          <div className="mt-4 pt-3 border-t border-surface-border">
            <h4 className="text-[11px] font-mono uppercase text-slate-400 font-bold mb-1.5">
              Documented Exponential Limitations:
            </h4>
            <ul className="space-y-1 text-xs text-slate-400">
              {exponential.limitations.map((lim, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-purple-400">•</span>
                  <span>{lim}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
