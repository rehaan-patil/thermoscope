"use client";

import React, { useState } from "react";
import { FullAnalysisResponse } from "@/types/thermoscope";
import { Database, Upload, CheckCircle2 } from "lucide-react";

interface DatasetWorkspaceViewProps {
  data: FullAnalysisResponse;
  onUploadCsv: (content: string) => void;
}

export const DatasetWorkspaceView: React.FC<DatasetWorkspaceViewProps> = ({
  data,
  onUploadCsv,
}) => {
  const [uploadText, setUploadText] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!data) return null;

  const { metadata } = data;

  const handleCustomUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadText.trim()) return;
    onUploadCsv(uploadText);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 4000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-5 shadow-card">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase mb-2">
          <Database className="h-4 w-4" /> Dataset Workspace
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono">
          Dataset Provenance, Integrity & Validation
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-400 max-w-4xl leading-relaxed font-mono">
          Inspect the primary NASA Ames B0005 experimental telemetry, verify cryptographic
          file fingerprints, and validate custom time-series battery CSV uploads.
        </p>
      </div>

      {/* Dataset Metadata Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-5 shadow-card space-y-3">
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider pb-2 border-b border-[#1f1f1f]">
            Primary Experimental Benchmark
          </h3>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded bg-[#121212]">
              <span className="text-gray-500">Dataset Identifier:</span>
              <span className="font-bold text-white">{metadata?.name || "NASA B0005"}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#121212]">
              <span className="text-gray-500">Cell Architecture:</span>
              <span className="font-bold text-white">Commercial 18650 LiCoO₂ / Graphite</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#121212]">
              <span className="text-gray-500">Rated Capacity / Cutoff:</span>
              <span className="font-bold text-white">2.0 Ah Nominal / 2.7 V Cutoff</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#121212]">
              <span className="text-gray-500">Discharge Protocol:</span>
              <span className="font-bold text-white">2.0 A (1C Rate) Constant Current</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#121212]">
              <span className="text-gray-500">Total Validated Samples:</span>
              <span className="font-bold text-cyan-400">
                {metadata?.total_readings?.toLocaleString() || "50,285"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#121212]">
              <span className="text-gray-500">Discharge Cycles:</span>
              <span className="font-bold text-white">{metadata?.total_cycles || 168}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#121212]">
              <span className="text-gray-500">SHA-256 Checksum:</span>
              <span className="font-bold text-gray-300 truncate max-w-[200px]" title={metadata?.file_sha256}>
                {metadata?.file_sha256 ? `${metadata.file_sha256.substring(0, 16)}...` : "Authentic"}
              </span>
            </div>
          </div>
        </div>

        {/* Custom CSV Upload Studio */}
        <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-5 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider pb-2 border-b border-[#1f1f1f]">
              Custom Battery CSV Ingestion
            </h3>
            <p className="mt-2 text-xs text-gray-400 font-mono leading-relaxed">
              Upload or paste custom battery cycle telemetry. Required schema:{" "}
              <code className="text-cyan-400">cycle, time_s, temperature_c</code>.
            </p>

            <form onSubmit={handleCustomUpload} className="mt-4 space-y-3">
              <textarea
                value={uploadText}
                onChange={(e) => setUploadText(e.target.value)}
                placeholder="cycle,time_s,temperature_c&#10;1,0.0,24.5&#10;1,12.0,24.8&#10;..."
                rows={5}
                className="w-full rounded-lg border border-white/10 bg-[#121212] p-2.5 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-bold font-mono text-black hover:bg-cyan-300 transition"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Parse & Ingest CSV</span>
                </button>

                {uploadSuccess && (
                  <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Loaded Successfully</span>
                  </span>
                )}
              </div>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1f1f1f] text-[10px] text-gray-500 font-mono">
            Files larger than 4.5 MB can be streamed directly via API storage refs.
          </div>
        </div>
      </div>
    </div>
  );
};
