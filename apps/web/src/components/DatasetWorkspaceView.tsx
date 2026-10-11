"use client";

import React, { useState } from "react";
import { FullAnalysisResponse } from "@/types/thermoscope";
import { Database, FileCheck, Upload, AlertCircle, CheckCircle2, Shield } from "lucide-react";

interface DatasetWorkspaceViewProps {
  data: FullAnalysisResponse;
  onUploadCsv: (content: string) => void;
}

export const DatasetWorkspaceView: React.FC<DatasetWorkspaceViewProps> = ({
  data,
  onUploadCsv,
}) => {
  const { metadata, cycles } = data;
  const [uploadText, setUploadText] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleCustomUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadText.trim()) return;
    onUploadCsv(uploadText);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-6">
        <div className="flex items-center gap-2 text-brand-cyan text-xs font-mono font-bold uppercase mb-2">
          <Database className="h-4 w-4" /> Dataset Workspace
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Dataset Provenance, Integrity & Validation
        </h2>
        <p className="mt-1 text-sm text-slate-300 max-w-4xl leading-relaxed">
          Inspect the primary NASA Ames B0005 experimental telemetry, verify cryptographic
          file fingerprints, and validate custom time-series battery CSV uploads.
        </p>
      </div>

      {/* Dataset Metadata Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-surface-border bg-surface-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white pb-2 border-b border-surface-border">
            Primary Experimental Benchmark
          </h3>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded bg-surface-elevated">
              <span className="text-slate-400">Dataset Identifier:</span>
              <span className="font-bold text-white">{metadata.name}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-elevated">
              <span className="text-slate-400">Cell Specifications:</span>
              <span className="font-bold text-white">Commercial 18650 LiCoO₂ / Graphite</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-elevated">
              <span className="text-slate-400">Total Observations:</span>
              <span className="font-bold text-brand-cyan">
                {metadata.total_readings.toLocaleString()} rows
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-elevated">
              <span className="text-slate-400">Discharge Cycles:</span>
              <span className="font-bold text-white">{metadata.total_cycles} cycles</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-elevated">
              <span className="text-slate-400">Non-Physical Exclusions:</span>
              <span className="font-bold text-emerald-400">
                {metadata.excluded_records} records excluded
              </span>
            </div>
            <div className="p-2 rounded bg-surface-elevated break-all">
              <span className="text-slate-400 block mb-1">SHA-256 Cryptographic Hash:</span>
              <span className="text-[11px] text-brand-cyan font-bold">
                {metadata.file_sha256}
              </span>
            </div>
          </div>
        </div>

        {/* Custom CSV Upload & Validation */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border">
            <h3 className="text-sm font-bold text-white">Custom Telemetry CSV Upload</h3>
            <span className="text-xs font-mono text-slate-400">Direct Ingest</span>
          </div>

          <form onSubmit={handleCustomUpload} className="space-y-3">
            <p className="text-xs text-slate-400">
              Paste custom battery CSV telemetry with headers: <code>cycle</code>,{" "}
              <code>time_s</code>, <code>temperature_c</code>.
            </p>
            <textarea
              rows={4}
              value={uploadText}
              onChange={(e) => setUploadText(e.target.value)}
              placeholder="cycle,time_s,temperature_c,voltage_v&#10;1,10.5,24.3,4.19&#10;1,21.0,24.5,4.18..."
              className="w-full rounded-lg border border-surface-border bg-surface-elevated p-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />

            <div className="flex items-center justify-between pt-1">
              <button
                type="submit"
                disabled={!uploadText.trim()}
                className="flex items-center gap-2 rounded-lg bg-brand-cyan px-4 py-2 text-xs font-mono font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-40 transition shadow-sm"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Ingest & Run Statistical Pipeline</span>
              </button>

              {uploadSuccess && (
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Pipeline Updated
                </span>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Cycle Summary Preview Table */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-6">
        <h3 className="text-sm font-bold text-white mb-3">Cycle Telemetry Snapshot Preview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-surface-border text-slate-400 bg-surface-elevated/40">
              <tr>
                <th className="p-2.5">Cycle</th>
                <th className="p-2.5">Min Temp (°C)</th>
                <th className="p-2.5">Mean Temp (°C)</th>
                <th className="p-2.5">Max Temp (°C)</th>
                <th className="p-2.5">Episode Events</th>
                <th className="p-2.5">Reading Events</th>
                <th className="p-2.5">Duration (s)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-slate-200">
              {cycles.slice(0, 10).map((c) => (
                <tr key={c.cycle} className="hover:bg-surface-elevated/50 transition">
                  <td className="p-2.5 font-bold text-white">#{c.cycle}</td>
                  <td className="p-2.5">{c.min_temperature.toFixed(2)}</td>
                  <td className="p-2.5">{c.mean_temperature.toFixed(2)}</td>
                  <td
                    className={`p-2.5 font-bold ${
                      c.max_temperature >= 40.0 ? "text-amber-400" : "text-white"
                    }`}
                  >
                    {c.max_temperature.toFixed(2)}
                  </td>
                  <td className="p-2.5 text-brand-cyan">{c.episode_count}</td>
                  <td className="p-2.5 text-amber-400">{c.reading_count}</td>
                  <td className="p-2.5 text-slate-400">{c.duration_s.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
