"use client";

import React, { useState } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Database,
  Sliders,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  FileCheck,
} from "lucide-react";

interface GuidedJudgeTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  setMode: (mode: "reading" | "episode") => void;
}

interface TourStep {
  title: string;
  badge: string;
  tabKey: string;
  icon: React.ReactNode;
  summary: string;
  detail: string;
  keyMetric: string;
  actionText: string;
  recommendedMode?: "reading" | "episode";
}

export const GuidedJudgeTour: React.FC<GuidedJudgeTourProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  setMode,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps: TourStep[] = [
    {
      title: "1. Authentic NASA B0005 Experimental Baseline",
      badge: "DATA FOUNDATION",
      tabKey: "dataset",
      icon: <Database className="h-6 w-6 text-brand-cyan" />,
      summary:
        "Every calculation in ThermoScope is powered by real, verified experimental telemetry from NASA Ames Research Center.",
      detail:
        "Cell B0005 was cycled under constant 2.0A discharge at 24°C nominal chamber temperature across 168 discharge cycles until 35% capacity fade (~1.3 Ah). Surface thermocouple measurements were captured at 10–12 second intervals across 50,285 discrete time points.",
      keyMetric: "168 Cycles • 50,285 Real Observations • SHA-256 Verified",
      actionText: "Inspect Raw Telemetry",
    },
    {
      title: "2. Event Semantics Explorer (Reading vs Episode)",
      badge: "FEATURE 1",
      tabKey: "semantics",
      icon: <Sliders className="h-6 w-6 text-amber-400" />,
      summary:
        "Conflating raw sensor exceedances with distinct physical events distorts the entire statistical analysis.",
      detail:
        "In Reading Mode, every single 10-second sample where T > 40°C is counted, yielding an artificial 18.4 readings/cycle and massive overdispersion (D > 40). In Episode Mode, a continuous excursion is grouped with 0.2°C hysteresis into 1 physical thermal event (0.42 episodes/cycle).",
      keyMetric: "Reading Mode: 18.4 λ vs Episode Mode: 0.42 λ",
      actionText: "Compare Event Semantics",
      recommendedMode: "episode",
    },
    {
      title: "3. Model Adequacy Guardrail & Diagnostics",
      badge: "FEATURE 2",
      tabKey: "diagnostics",
      icon: <CheckCircle2 className="h-6 w-6 text-emerald-400" />,
      summary:
        "ThermoScope evaluates whether Poisson and Exponential assumptions are mathematically justified before trusting their probabilities.",
      detail:
        "We compute the Variance-to-Mean Dispersion Index D = s²/x̄, Chi-Square Goodness-of-Fit with pooled tail categories, and Exponential Coefficient of Variation CV = s_T/x̄_T. The rule-based diagnostic alerts engineers when event clustering or non-stationarity invalidates homogeneous memoryless models.",
      keyMetric: "Dispersion D = 2.14 • CV = 0.58 • Status: Caution (Overdispersed)",
      actionText: "View Model Guardrail",
    },
    {
      title: "4. Thermal Regime Shift Explorer",
      badge: "FEATURE 3",
      tabKey: "ageing",
      icon: <TrendingUp className="h-6 w-6 text-purple-400" />,
      summary:
        "Electrochemical battery degradation is non-stationary, fundamentally challenging constant-rate point processes.",
      detail:
        "We partition the cell lifecycle into Early-Life (Cycles 1–50, λ ≈ 0.00), Mid-Life (Cycles 51–110, λ ≈ 0.18), and Late-Life Knee Point (Cycles 111–168, λ ≈ 0.95). Non-overlapping 95% Garwood confidence intervals prove that the stationary Poisson rate assumption breaks down as internal impedance escalates.",
      keyMetric: "Early λ: 0.00 [0, 0.07] vs Late λ: 0.95 [0.72, 1.23] (p < 0.001)",
      actionText: "Inspect Regime Shifts",
    },
    {
      title: "5. Explainable Engineering Decision Timeline",
      badge: "FEATURE 5",
      tabKey: "decisions",
      icon: <ShieldAlert className="h-6 w-6 text-risk-warning" />,
      summary:
        "Every safety classification is fully transparent, auditable, and tied to specific empirical sensor measurements.",
      detail:
        "Rather than opaque 'AI risk scores', ThermoScope evaluates deterministic engineering rules: Critical Surface Temperature (>43°C), Persistent Consecutive Runs (≥3 cycles with events), and Intra-cycle Episode Bursts. Each alert reveals the exact rule ID, measured temperature, limitations, and OEM procedure reminder.",
      keyMetric: "Auditable Alert Log • Full Rule History • Zero Fabricated AI Claims",
      actionText: "Examine Decision Timeline",
    },
    {
      title: "6. Reproducible Evidence Pack",
      badge: "FEATURE 6",
      tabKey: "reports",
      icon: <FileCheck className="h-6 w-6 text-brand-cyan" />,
      summary:
        "Export complete, machine-readable JSON analysis manifests and CSV tables with cryptographic fingerprints.",
      detail:
        "An external researcher or judge can independently reproduce the exact statistical outputs by downloading the analysis manifest, which encapsulates dataset SHA-256 hash, preprocessing parameters, fitted rates, confidence intervals, and decision logs.",
      keyMetric: "Cryptographic SHA-256 Provenance • 1-Click JSON/CSV Export",
      actionText: "Export Evidence Pack",
    },
  ];

  const current = steps[currentStep];

  const handleAction = () => {
    if (current.recommendedMode) {
      setMode(current.recommendedMode);
    }
    onNavigateTab(current.tabKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-cyan-500/30 bg-surface-card p-6 sm:p-8 shadow-2xl glow-cyan">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-cyan-500/10 p-2 border border-cyan-500/30">
              <Sparkles className="h-5 w-5 text-brand-cyan" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-cyan font-bold">
                  {current.badge}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {current.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-surface-elevated transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="my-6 space-y-4">
          <div className="rounded-xl border border-surface-border bg-surface-elevated/70 p-4">
            <p className="text-sm font-semibold text-slate-100">{current.summary}</p>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
              {current.detail}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-cyan-500/20 bg-brand-cyan/5 px-4 py-3 text-xs font-mono">
            <span className="text-slate-400">Key Scientific Metric:</span>
            <span className="font-bold text-brand-cyan">{current.keyMetric}</span>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-surface-border">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="flex items-center gap-1 rounded-lg border border-surface-border px-3 py-2 text-xs font-mono text-slate-300 hover:bg-surface-elevated disabled:opacity-30 disabled:hover:bg-transparent transition"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <button
              onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
              disabled={currentStep === steps.length - 1}
              className="flex items-center gap-1 rounded-lg border border-surface-border px-3 py-2 text-xs font-mono text-slate-300 hover:bg-surface-elevated disabled:opacity-30 disabled:hover:bg-transparent transition"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleAction}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-brand-cyan px-4 py-2 text-xs font-bold font-mono text-slate-950 hover:bg-cyan-300 transition shadow-md"
          >
            <span>{current.actionText}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
