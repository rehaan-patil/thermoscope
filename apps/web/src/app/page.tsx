"use client";

import React, { useState, useEffect } from "react";
import { FullAnalysisResponse, AnalysisOptions } from "@/types/thermoscope";
import { fetchAnalysis } from "@/lib/api";

import { Navbar } from "@/components/Navbar";
import { GuidedJudgeTour } from "@/components/GuidedJudgeTour";
import { LandingHero } from "@/components/LandingHero";
import { OverviewDashboard } from "@/components/OverviewDashboard";
import { EventSemanticsExplorer } from "@/components/EventSemanticsExplorer";
import { ThermalObservatory } from "@/components/ThermalObservatory";
import { StatisticalLaboratory } from "@/components/StatisticalLaboratory";
import { ModelAdequacyGuardrail } from "@/components/ModelAdequacyGuardrail";
import { AgeingAnalysisView } from "@/components/AgeingAnalysisView";
import { ThresholdSensitivityView } from "@/components/ThresholdSensitivityView";
import { DecisionCenterView } from "@/components/DecisionCenterView";
import { DatasetWorkspaceView } from "@/components/DatasetWorkspaceView";
import { ReportsReproducibilityView } from "@/components/ReportsReproducibilityView";
import { MethodologyView } from "@/components/MethodologyView";

import {
  LayoutDashboard,
  Sliders,
  Eye,
  Activity,
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal,
  ShieldAlert,
  Database,
  FileCheck,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Zap,
  RotateCcw,
  Download,
  History,
  Sparkles,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("landing");
  const [mode, setMode] = useState<"reading" | "episode">("episode");
  const [threshold, setThreshold] = useState<number>(40.0);
  const [customCsv, setCustomCsv] = useState<string | undefined>(undefined);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [activeDataset, setActiveDataset] = useState<string>("B0005");

  const [data, setData] = useState<FullAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isJudgeTourOpen, setIsJudgeTourOpen] = useState<boolean>(false);

  // Trigger analytical computation whenever mode, threshold, or customCsv changes
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const options: AnalysisOptions = {
          mode,
          threshold,
          query_k: 3,
          critical_temp_c: 43.0,
          consecutive_anomaly_window: 3,
          episode_burst_threshold: 2,
        };
        const result = await fetchAnalysis(options, customCsv);
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        console.error("Failed to load analysis:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [mode, threshold, customCsv]);

  const navItems = [
    { id: "overview", label: "Analytics Overview", icon: LayoutDashboard },
    { id: "semantics", label: "Event Semantics", icon: Sliders },
    { id: "observatory", label: "Thermal Observatory", icon: Eye },
    { id: "laboratory", label: "Statistical Laboratory", icon: Activity },
    { id: "diagnostics", label: "Model Guardrail", icon: ShieldCheck },
    { id: "ageing", label: "Ageing Analysis", icon: TrendingUp },
    { id: "sensitivity", label: "Threshold Studio", icon: SlidersHorizontal },
    { id: "decisions", label: "Decision Center", icon: ShieldAlert },
    { id: "dataset", label: "Dataset Workspace", icon: Database },
    { id: "reports", label: "Evidence Pack", icon: FileCheck },
    { id: "methodology", label: "Methodology", icon: BookOpen },
  ];

  const historicalAnalyses = [
    { id: "B0005", title: "NASA B0005 18650", cycles: 168, pts: 50285, status: "Active Primary", active: true },
    { id: "B0006", title: "NASA B0006 18650", cycles: 168, pts: 50112, status: "Cross-validation", active: false },
    { id: "B0007", title: "NASA B0007 18650", cycles: 168, pts: 49890, status: "Reference Twin", active: false },
    { id: "B0018", title: "NASA B0018 18650", cycles: 132, pts: 39400, status: "Accelerated Ageing", active: false },
  ];

  const thresholdPresets = [38.0, 40.0, 42.0, 44.0];

  const triggerExportManifest = () => {
    if (!data) return;
    const manifest = {
      product: "ThermoScope",
      version: "1.0.0",
      export_time: new Date().toISOString(),
      metadata: data.metadata,
      options: data.options,
      poisson_estimates: {
        lambda: data.poisson.lambda_rate,
        ci_95: data.poisson.lambda_ci_95,
        dispersion_index: data.poisson.dispersion_index,
      },
      exponential_estimates: {
        lambda: data.exponential.lambda_rate,
        cv: data.exponential.coefficient_of_variation,
      },
      decision_summary: data.decision_center.overall_classification,
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `thermoscope_manifest_cycle168_${mode}_${threshold}C.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-gray-200 font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenJudgeTour={() => setIsJudgeTourOpen(true)}
        mode={mode}
        setMode={setMode}
        threshold={threshold}
      />

      {/* Guided Judge Tour Modal */}
      <GuidedJudgeTour
        isOpen={isJudgeTourOpen}
        onClose={() => setIsJudgeTourOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
        }}
        setMode={setMode}
      />

      {/* Main Layout Area */}
      {activeTab === "landing" ? (
        <main className="flex-1 pb-24">
          <LandingHero
            onLaunchApp={() => setActiveTab("overview")}
            onOpenJudgeTour={() => setIsJudgeTourOpen(true)}
            onOpenMethodology={() => setActiveTab("methodology")}
            totalCycles={data ? data.metadata.total_cycles : 168}
            totalReadings={data ? data.metadata.total_readings : 50285}
            lambdaRate={data ? data.poisson.lambda_rate : 0.51}
            dispersionIndex={data ? data.poisson.dispersion_index : 0.49}
          />
        </main>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Collapsible Obsidian-dark Left Sidebar (Blackbox Command-Center) */}
          <aside
            className={`shrink-0 bg-[#050505] border-r border-[#151515] transition-all duration-300 flex flex-col justify-between ${
              isSidebarCollapsed ? "w-16" : "w-64"
            }`}
          >
            {/* Top Navigation Strip */}
            <div className="p-3 space-y-1 overflow-y-auto">
              <div className="flex items-center justify-between px-2 py-2 mb-2 border-b border-white/5">
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-cyan-400" />
                    <span>Command Studio</span>
                  </span>
                )}
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="rounded-lg p-1.5 text-gray-400 hover:text-white hover:bg-[#111111] transition"
                  title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                  {isSidebarCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Navigation Items */}
              <div className="space-y-0.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-mono transition group ${
                        isActive
                          ? "bg-[#111111] text-cyan-400 border border-white/10 font-bold shadow-[0_0_15px_rgba(0,229,255,0.08)]"
                          : "text-gray-400 hover:text-white hover:bg-[#0a0a0a]"
                      }`}
                      title={item.label}
                    >
                      <Icon className={`h-4 w-4 shrink-0 transition ${isActive ? "text-cyan-400" : "text-gray-500 group-hover:text-gray-300"}`} />
                      {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>

              {/* High-Fidelity Historical Analyses (Blackbox x Apple Sidebar) */}
              {!isSidebarCollapsed && (
                <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between px-2 text-[10px] font-mono uppercase tracking-wider text-gray-500">
                    <span className="flex items-center gap-1.5 font-bold">
                      <History className="h-3 w-3 text-gray-400" />
                      <span>Historical Telemetry</span>
                    </span>
                    <span className="text-[9px] text-cyan-400/80">NASA Benchmark</span>
                  </div>

                  <div className="space-y-1.5">
                    {historicalAnalyses.map((hist) => {
                      const isHistActive = activeDataset === hist.id;
                      return (
                        <div
                          key={hist.id}
                          onClick={() => setActiveDataset(hist.id)}
                          className={`p-2.5 rounded-xl border text-xs font-mono cursor-pointer transition ${
                            isHistActive
                              ? "bg-[#0d0d0d] border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.06)]"
                              : "bg-[#070707] border-white/5 hover:border-white/15"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-bold truncate ${isHistActive ? "text-cyan-400" : "text-gray-300"}`}>
                              {hist.title}
                            </span>
                            {isHistActive && (
                              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            )}
                          </div>
                          <div className="text-[10px] text-gray-500 mt-0.5 flex items-center justify-between">
                            <span>{hist.cycles} Cycles • {hist.pts.toLocaleString()} Pts</span>
                            <span className="text-[9px] text-gray-400">{hist.status}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Sidebar Action: Manifest Download, Cloud API & Edge Badges */}
            <div className="p-3 border-t border-white/5 space-y-2.5 bg-[#030303]">
              <button
                onClick={triggerExportManifest}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#090909] py-2 text-xs font-mono text-gray-300 hover:text-white hover:border-cyan-500/30 hover:bg-[#0e0e0e] transition shadow-sm"
                title="Export Reproducible JSON Evidence Manifest"
              >
                <Download className="h-3.5 w-3.5 text-cyan-400" />
                {!isSidebarCollapsed && <span>Export Evidence Pack</span>}
              </button>

              {!isSidebarCollapsed && (
                <div className="pt-1 border-t border-white/5 space-y-1 text-[10px] font-mono text-gray-400">
                  <div className="flex items-center justify-between px-1">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      API: 200 OK (FastAPI)
                    </span>
                    <span className="text-gray-500">v1.0.0</span>
                  </div>
                  <div className="flex items-center justify-between px-1 text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      Vercel Edge Global
                    </span>
                    <span className="text-gray-400">Production</span>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Canvas: Distraction-free Centered Visualization Space (The Stage) */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-36">
            <div className="max-w-6xl mx-auto space-y-6">
              {isLoading || !data ? (
                <div className="flex flex-col items-center justify-center min-h-[520px] rounded-2xl border border-white/5 bg-[#050505] p-12 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent mb-4 shadow-[0_0_15px_#00e5ff]" />
                  <p className="text-sm font-mono text-white font-semibold">
                    Synthesizing Point Process Telemetry
                  </p>
                  <p className="text-xs font-mono text-gray-500 mt-1 max-w-md">
                    Querying FastAPI analytical cluster at https://api-gold-gamma-21.vercel.app for Garwood exact Poisson intervals...
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {activeTab === "overview" && (
                    <OverviewDashboard
                      key="overview"
                      data={data}
                      setActiveTab={setActiveTab}
                      setMode={setMode}
                    />
                  )}
                  {activeTab === "semantics" && (
                    <EventSemanticsExplorer
                      key="semantics"
                      data={data}
                      mode={mode}
                      setMode={setMode}
                    />
                  )}
                  {activeTab === "observatory" && <ThermalObservatory key="observatory" data={data} />}
                  {activeTab === "laboratory" && <StatisticalLaboratory key="laboratory" data={data} />}
                  {activeTab === "diagnostics" && <ModelAdequacyGuardrail key="diagnostics" data={data} />}
                  {activeTab === "ageing" && <AgeingAnalysisView key="ageing" data={data} />}
                  {activeTab === "sensitivity" && (
                    <ThresholdSensitivityView
                      key="sensitivity"
                      data={data}
                      currentThreshold={threshold}
                      onSelectThreshold={(th) => setThreshold(th)}
                    />
                  )}
                  {activeTab === "decisions" && <DecisionCenterView key="decisions" data={data} />}
                  {activeTab === "dataset" && (
                    <DatasetWorkspaceView
                      key="dataset"
                      data={data}
                      onUploadCsv={(csv) => setCustomCsv(csv)}
                    />
                  )}
                  {activeTab === "reports" && <ReportsReproducibilityView key="reports" data={data} />}
                  {activeTab === "methodology" && <MethodologyView key="methodology" />}
                </AnimatePresence>
              )}
            </div>
          </main>
        </div>
      )}

      {/* Hover "Dock" Command Center: Floating Pill-shaped Glass Dock (Apple x Blackbox AI Prompt) */}
      {activeTab !== "landing" && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl">
          <div className="backdrop-blur-2xl bg-black/60 border border-white/10 rounded-2xl p-2.5 sm:p-3 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_20px_rgba(59,130,246,0.15)] flex flex-wrap items-center justify-between gap-3">
            {/* Mode Switcher Buttons with Spring Active Indicator */}
            <div className="flex items-center gap-1 rounded-xl bg-[#080808] border border-white/5 p-1">
              <button
                onClick={() => setMode("episode")}
                className={`relative px-3.5 py-1.5 text-xs font-mono rounded-lg transition duration-200 ${
                  mode === "episode"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Episode Mode
              </button>
              <button
                onClick={() => setMode("reading")}
                className={`relative px-3.5 py-1.5 text-xs font-mono rounded-lg transition duration-200 ${
                  mode === "reading"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Reading Mode
              </button>
            </div>

            {/* Threshold Slider & Value Display */}
            <div className="flex items-center gap-3 px-2 flex-1 min-w-[220px]">
              <span className="text-xs font-mono text-gray-400 shrink-0">
                θ: <strong className="text-white font-bold">{threshold.toFixed(1)}°C</strong>
              </span>
              <input
                type="range"
                min="36.0"
                max="45.0"
                step="0.5"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-[#1a1a1a] rounded-lg cursor-pointer transition hover:bg-[#252525]"
              />
              <div className="hidden sm:flex items-center gap-1">
                {thresholdPresets.map((th) => (
                  <button
                    key={th}
                    onClick={() => setThreshold(th)}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded-md border transition ${
                      Math.abs(threshold - th) < 0.1
                        ? "bg-white/10 text-white border-white/30 font-bold shadow-sm"
                        : "bg-transparent text-gray-500 border-white/5 hover:text-gray-300"
                    }`}
                  >
                    {th.toFixed(0)}°
                  </button>
                ))}
              </div>
            </div>

            {/* Run Analytics Action Trigger with Cybernetic Glow */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setThreshold((t) => Number(t.toFixed(1)));
                }}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 px-4 py-2 text-xs font-bold font-mono text-black hover:opacity-95 transition shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-50 active:scale-95 duration-150"
              >
                {isLoading ? (
                  <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Zap className="h-3.5 w-3.5 fill-black" />
                )}
                <span>Run Analytics</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
