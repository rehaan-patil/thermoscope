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
  Flame,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("landing");
  const [mode, setMode] = useState<"reading" | "episode">("episode");
  const [threshold, setThreshold] = useState<number>(40.0);
  const [customCsv, setCustomCsv] = useState<string | undefined>(undefined);

  const [data, setData] = useState<FullAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isJudgeTourOpen, setIsJudgeTourOpen] = useState<boolean>(false);

  // Load analytical data when mode, threshold, or customCsv changes
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

  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-100 font-sans">
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

      {/* Main Content Area */}
      {activeTab === "landing" ? (
        <main className="flex-1">
          <LandingHero
            onLaunchApp={() => setActiveTab("overview")}
            onOpenJudgeTour={() => setIsJudgeTourOpen(true)}
            onOpenMethodology={() => setActiveTab("methodology")}
            totalCycles={data ? data.metadata.total_cycles : 168}
            totalReadings={data ? data.metadata.total_readings : 50285}
            lambdaRate={data ? data.poisson.lambda_rate : 0.42}
            dispersionIndex={data ? data.poisson.dispersion_index : 2.14}
          />
        </main>
      ) : (
        <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 shrink-0">
              <div className="sticky top-20 rounded-xl border border-surface-border bg-surface-card p-3 space-y-1">
                <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  Navigation
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono font-medium transition ${
                        isActive
                          ? "bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 font-bold"
                          : "text-slate-400 hover:text-white hover:bg-surface-elevated"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Workspace View Area */}
            <main className="flex-1 min-w-0">
              {isLoading || !data ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-surface-border bg-surface-card p-12 text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-cyan border-t-transparent mb-4" />
                  <p className="text-sm font-mono text-slate-400">
                    Executing statistical engine calculations...
                  </p>
                </div>
              ) : (
                <>
                  {activeTab === "overview" && (
                    <OverviewDashboard
                      data={data}
                      setActiveTab={setActiveTab}
                      setMode={setMode}
                    />
                  )}
                  {activeTab === "semantics" && (
                    <EventSemanticsExplorer
                      data={data}
                      mode={mode}
                      setMode={setMode}
                    />
                  )}
                  {activeTab === "observatory" && <ThermalObservatory data={data} />}
                  {activeTab === "laboratory" && <StatisticalLaboratory data={data} />}
                  {activeTab === "diagnostics" && <ModelAdequacyGuardrail data={data} />}
                  {activeTab === "ageing" && <AgeingAnalysisView data={data} />}
                  {activeTab === "sensitivity" && (
                    <ThresholdSensitivityView
                      data={data}
                      currentThreshold={threshold}
                      onSelectThreshold={(th) => setThreshold(th)}
                    />
                  )}
                  {activeTab === "decisions" && <DecisionCenterView data={data} />}
                  {activeTab === "dataset" && (
                    <DatasetWorkspaceView
                      data={data}
                      onUploadCsv={(csv) => setCustomCsv(csv)}
                    />
                  )}
                  {activeTab === "reports" && <ReportsReproducibilityView data={data} />}
                  {activeTab === "methodology" && <MethodologyView />}
                </>
              )}
            </main>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-surface-border bg-surface-card/60 py-6 text-xs font-mono text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-brand-cyan" />
            <span className="text-slate-300 font-bold">ThermoScope v1.0.0</span>
            <span>— Open-Source Battery Thermal Analytics</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>NASA PCoE B0005 Benchmark</span>
            <span>•</span>
            <a
              href="https://github.com/Rehaan5823/thermoscope"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition flex items-center gap-1.5"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
