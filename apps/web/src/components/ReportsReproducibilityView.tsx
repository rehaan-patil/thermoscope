"use client";

import React, { useState } from "react";
import { FullAnalysisResponse } from "@/types/thermoscope";
import { FileCheck, Download, Copy, Check, ShieldCheck, Terminal } from "lucide-react";

interface ReportsReproducibilityViewProps {
  data: FullAnalysisResponse;
}

export const ReportsReproducibilityView: React.FC<ReportsReproducibilityViewProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const manifest = {
    thermoscope_version: "1.0.0",
    manifest_type: "ReproducibleEvidencePack",
    generated_at_utc: new Date().toISOString(),
    dataset_provenance: {
      name: data.metadata.name,
      sha256: data.metadata.file_sha256,
      total_readings: data.metadata.total_readings,
      total_cycles: data.metadata.total_cycles,
      excluded_records: data.metadata.excluded_records,
      origin: data.metadata.provenance,
    },
    analysis_configuration: data.options,
    statistical_findings: {
      poisson: {
        lambda_rate: data.poisson.lambda_rate,
        lambda_ci_95: data.poisson.lambda_ci_95,
        dispersion_index: data.poisson.dispersion_index,
        adequacy_status: data.poisson.adequacy_status,
      },
      exponential: {
        mean_waiting_time: data.exponential.mean_waiting_time,
        lambda_rate: data.exponential.lambda_rate,
        coefficient_of_variation: data.exponential.coefficient_of_variation,
        adequacy_status: data.exponential.adequacy_status,
      },
      regime_shift: {
        has_regime_shift: data.regime_shift.has_regime_shift,
        conclusion: data.regime_shift.conclusion,
      },
    },
    decision_summary: {
      overall_classification: data.decision_center.overall_classification,
      alert_counts: data.decision_center.alert_counts,
      total_alerts: data.decision_center.alerts.length,
    },
    disclaimer: data.decision_center.disclaimer,
  };

  const jsonString = JSON.stringify(manifest, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `thermoscope_evidence_manifest_${data.options.mode}_${data.options.threshold}c.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    // Generate CSV in browser directly
    const headers = [
      "cycle",
      "min_temp_c",
      "mean_temp_c",
      "max_temp_c",
      "episode_events",
      "reading_events",
      "duration_s",
    ];
    const rows = data.cycles.map((c) =>
      [
        c.cycle,
        c.min_temperature,
        c.mean_temperature,
        c.max_temperature,
        c.episode_count,
        c.reading_count,
        c.duration_s,
      ].join(",")
    );
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `thermoscope_cycle_summary_${data.options.mode}_${data.options.threshold}c.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-6">
        <div className="flex items-center gap-2 text-brand-cyan text-xs font-mono font-bold uppercase mb-2">
          <FileCheck className="h-4 w-4" /> Feature 6 — Reproducible Evidence Pack
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Cryptographically Auditable Evidence Manifest
        </h2>
        <p className="mt-1 text-sm text-slate-300 max-w-4xl leading-relaxed">
          ThermoScope enables external researchers, regulatory reviewers, and hackathon judges
          to reconstruct and verify the entire statistical analysis without guessing parameters or thresholds.
        </p>
      </div>

      {/* Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-surface-border bg-surface-card p-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Dataset Fingerprint:</span>
          <strong className="text-white truncate max-w-xs">{data.metadata.file_sha256}</strong>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface-elevated px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white transition"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied" : "Copy JSON"}</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 rounded-lg bg-brand-cyan px-3 py-1.5 text-xs font-mono font-bold text-slate-950 hover:bg-cyan-300 transition shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Manifest (.JSON)</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface-elevated px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Table (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Manifest JSON Viewer */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-6">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Terminal className="h-3.5 w-3.5 text-brand-cyan" />
            <span>Machine-Readable Analysis Manifest (JSON)</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Schema v1.0.0</span>
        </div>

        <pre className="p-4 rounded-lg bg-surface-elevated text-slate-300 text-xs font-mono overflow-x-auto max-h-[460px] leading-relaxed border border-surface-border">
          {jsonString}
        </pre>
      </div>
    </div>
  );
};
