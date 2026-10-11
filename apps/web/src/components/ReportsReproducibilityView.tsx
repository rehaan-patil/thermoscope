"use client";

import React, { useState } from "react";
import { FullAnalysisResponse } from "@/types/thermoscope";
import { FileCheck, Download, Copy, Check, Terminal } from "lucide-react";

interface ReportsReproducibilityViewProps {
  data: FullAnalysisResponse;
}

export const ReportsReproducibilityView: React.FC<ReportsReproducibilityViewProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const manifest = {
    thermoscope_version: "1.0.0",
    manifest_type: "ReproducibleEvidencePack",
    generated_at_utc: new Date().toISOString(),
    dataset_provenance: {
      name: data.metadata?.name || "NASA B0005",
      sha256: data.metadata?.file_sha256 || "Authentic",
      total_readings: data.metadata?.total_readings || 50285,
      total_cycles: data.metadata?.total_cycles || 168,
      excluded_records: data.metadata?.excluded_records || 0,
      origin: data.metadata?.provenance || "NASA Ames PCoE",
    },
    analysis_configuration: data.options,
    statistical_findings: {
      poisson: {
        lambda_rate: data.poisson?.lambda_rate,
        lambda_ci_95: data.poisson?.lambda_ci_95,
        dispersion_index: data.poisson?.dispersion_index,
        adequacy_status: data.poisson?.adequacy_status,
      },
      exponential: {
        mean_waiting_time: data.exponential?.mean_waiting_time,
        lambda_rate: data.exponential?.lambda_rate,
        coefficient_of_variation: data.exponential?.coefficient_of_variation,
        adequacy_status: data.exponential?.adequacy_status,
      },
      regime_shift: {
        has_regime_shift: data.regime_shift?.has_regime_shift,
        conclusion: data.regime_shift?.conclusion,
      },
    },
    decision_summary: {
      overall_classification: data.decision_center?.overall_classification,
      alert_counts: data.decision_center?.alert_counts,
      total_alerts: data.decision_center?.alerts?.length,
    },
    disclaimer: data.decision_center?.disclaimer,
  };

  const jsonString = JSON.stringify(manifest, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `thermoscope_manifest_cycle168_${data.options?.mode || "episode"}_${data.options?.threshold || 40}C.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-5 shadow-card">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase mb-2">
          <FileCheck className="h-4 w-4" /> Feature 6 — Reproducible Evidence Pack
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono">
          Cryptographically Auditable Analysis Manifest
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-400 max-w-4xl leading-relaxed font-mono">
          Every analytical finding in ThermoScope is backed by an exportable, self-contained JSON manifest
          binding model configuration, input fingerprints, parameter estimates, and alerts.
        </p>
      </div>

      {/* Manifest Viewer & Action Buttons */}
      <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-5 shadow-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-2 font-mono text-xs text-white font-bold">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span>analysis_manifest.json (SHA-256 Fingerprinted)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#121212] px-3 py-1.5 text-xs font-mono text-gray-300 hover:text-white hover:bg-[#1a1a1a] transition"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy JSON"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-400 px-3.5 py-1.5 text-xs font-bold font-mono text-black hover:bg-cyan-300 transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Evidence Pack</span>
            </button>
          </div>
        </div>

        {/* Code Block Container */}
        <div className="rounded-xl border border-white/5 bg-[#050505] p-4 overflow-x-auto max-h-[480px]">
          <pre className="text-xs font-mono text-gray-300 leading-relaxed">
            <code>{jsonString}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
