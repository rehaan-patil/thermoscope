"use client";

import React from "react";
import { FullAnalysisResponse } from "@/types/thermoscope";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";

interface ModelAdequacyGuardrailProps {
  data: FullAnalysisResponse;
}

export const ModelAdequacyGuardrail: React.FC<ModelAdequacyGuardrailProps> = ({ data }) => {
  if (!data) return null;

  const { poisson, exponential } = data;

  const isPoissonSupported = poisson?.adequacy_status?.includes("Supported");
  const isPoissonCaution = poisson?.adequacy_status?.includes("Caution");

  const isExponSupported = exponential?.adequacy_status?.includes("Supported");
  const isExponCaution = exponential?.adequacy_status?.includes("Caution");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="rounded-2xl border border-white/5 bg-[#080808]/90 backdrop-blur-xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase mb-2">
          <Shield className="h-4 w-4" /> Feature 2 — Model Adequacy Guardrail
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono">
          Statistical Model Suitability & Diagnostic Audit
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-400 max-w-4xl leading-relaxed font-mono">
          ThermoScope evaluates whether mathematical point-process assumptions hold before
          relying on derived probabilities. If empirical dispersion or aging trends violate theoretical
          assumptions, clear rule-based cautions are generated.
        </p>
      </div>

      {/* Main Guardrail Cards: Poisson vs Exponential */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Poisson Model Diagnostic Card */}
        <div className="rounded-2xl border border-white/5 bg-[#050505] p-5 shadow-[0_4px_25px_rgba(0,0,0,0.8)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Model Evaluation</span>
                <h3 className="text-sm font-bold text-white font-mono mt-0.5">Poisson Process Adequacy</h3>
              </div>
              <span
                className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                  isPoissonSupported
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    : isPoissonCaution
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                    : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                }`}
              >
                {poisson?.adequacy_status || "Evaluated"}
              </span>
            </div>

            {/* Diagnostic Metrics Table */}
            <div className="mt-4 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c0c0c] border border-white/5">
                <span className="text-gray-400">Sample Mean (x̄):</span>
                <span className="font-bold text-white">{poisson?.mean?.toFixed(3) || "0.000"}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c0c0c] border border-white/5">
                <span className="text-gray-400">Sample Variance (s²):</span>
                <span className="font-bold text-white">{poisson?.variance?.toFixed(3) || "0.000"}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c0c0c] border border-white/5">
                <span className="text-gray-400">Dispersion Index (D = s²/x̄):</span>
                <span
                  className={`font-bold ${
                    poisson?.dispersion_index && poisson.dispersion_index > 1.3
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {poisson?.dispersion_index ? poisson.dispersion_index.toFixed(2) : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c0c0c] border border-white/5">
                <span className="text-gray-400">Chi-Square GoF Test:</span>
                <span className="font-bold text-gray-300">
                  {poisson?.chi_square_stat
                    ? `χ² = ${poisson.chi_square_stat.toFixed(2)} (df=${poisson.chi_square_df}, p=${poisson.chi_square_p_value?.toFixed(3)})`
                    : "Pooled N/A (Low expected counts)"}
                </span>
              </div>
            </div>

            {/* Rationale explanation */}
            <div className="mt-4 p-3.5 rounded-xl bg-[#0c0c0c] border border-white/5 text-xs text-gray-300 leading-relaxed font-mono">
              <p className="font-semibold text-gray-200 mb-1">Diagnostic Rationale:</p>
              {poisson?.adequacy_rationale || "Calculated based on dispersion and sample size."}
            </div>
          </div>

          {/* Model Limitations Checklist */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <h4 className="text-[10px] font-mono uppercase text-gray-500 font-bold mb-1.5 tracking-wider">
              Documented Poisson Limitations:
            </h4>
            <ul className="space-y-1 text-xs text-gray-400 font-mono">
              {poisson?.limitations?.map((lim, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-cyan-400">•</span>
                  <span>{lim}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Exponential Model Diagnostic Card */}
        <div className="rounded-2xl border border-white/5 bg-[#050505] p-5 shadow-[0_4px_25px_rgba(0,0,0,0.8)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Model Evaluation</span>
                <h3 className="text-sm font-bold text-white font-mono mt-0.5">Exponential Waiting-Time Adequacy</h3>
              </div>
              <span
                className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                  isExponSupported
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    : isExponCaution
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                    : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                }`}
              >
                {exponential?.adequacy_status || "Evaluated"}
              </span>
            </div>

            {/* Diagnostic Metrics Table */}
            <div className="mt-4 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c0c0c] border border-white/5">
                <span className="text-gray-400">Mean Waiting Time (x̄_T):</span>
                <span className="font-bold text-white">
                  {exponential?.mean_waiting_time?.toFixed(2) || "0.00"} {exponential?.time_unit || "cycles"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c0c0c] border border-white/5">
                <span className="text-gray-400">Standard Deviation (s_T):</span>
                <span className="font-bold text-white">
                  {exponential?.std_waiting_time?.toFixed(2) || "0.00"} {exponential?.time_unit || "cycles"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c0c0c] border border-white/5">
                <span className="text-gray-400">Coefficient of Variation (CV = s_T/x̄_T):</span>
                <span
                  className={`font-bold ${
                    exponential?.coefficient_of_variation &&
                    (exponential.coefficient_of_variation > 1.25 ||
                      exponential.coefficient_of_variation < 0.8)
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {exponential?.coefficient_of_variation
                    ? exponential.coefficient_of_variation.toFixed(2)
                    : "N/A"}{" "}
                  <span className="text-[10px] text-gray-500">(Ideal = 1.0)</span>
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c0c0c] border border-white/5">
                <span className="text-gray-400">Observed Intervals (k):</span>
                <span className="font-bold text-white">{exponential?.n_intervals || 0}</span>
              </div>
            </div>

            {/* Rationale explanation */}
            <div className="mt-4 p-3.5 rounded-xl bg-[#0c0c0c] border border-white/5 text-xs text-gray-300 leading-relaxed font-mono">
              <p className="font-semibold text-gray-200 mb-1">Diagnostic Rationale:</p>
              {exponential?.adequacy_rationale || "Calculated based on coefficient of variation and interval count."}
            </div>
          </div>

          {/* Model Limitations Checklist */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <h4 className="text-[10px] font-mono uppercase text-gray-500 font-bold mb-1.5 tracking-wider">
              Documented Exponential Limitations:
            </h4>
            <ul className="space-y-1 text-xs text-gray-400 font-mono">
              {exponential?.limitations?.map((lim, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-purple-400">•</span>
                  <span>{lim}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
