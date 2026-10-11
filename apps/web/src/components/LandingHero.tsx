"use client";

import React from "react";
import {
  Sparkles,
  ArrowRight,
  Cpu,
  BookOpen,
  FileCheck,
  CheckCircle2,
  Sliders,
} from "lucide-react";

interface LandingHeroProps {
  onLaunchApp: () => void;
  onOpenJudgeTour: () => void;
  onOpenMethodology: () => void;
  totalCycles: number;
  totalReadings: number;
  lambdaRate: number;
  dispersionIndex: number | null;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onLaunchApp,
  onOpenJudgeTour,
  onOpenMethodology,
  totalCycles,
  totalReadings,
  lambdaRate,
  dispersionIndex,
}) => {
  return (
    <div className="relative overflow-hidden py-12 sm:py-20">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Editorial Eyebrow */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-surface-card px-3 py-1 text-xs font-mono text-brand-cyan shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-ping" />
            RESEARCH-GRADE BATTERY THERMAL ANALYTICS
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-surface-card px-3 py-1 text-xs font-mono text-slate-400">
            NASA Ames B0005 Li-ion Dataset
          </div>
        </div>

        {/* Main Title & Tagline */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Understand the signals{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-sky-400 to-blue-500">
              before they become risks.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
            A rigorous statistical decision-support framework investigating abnormal thermal
            excursions across lithium-ion battery lifespans using Poisson and Exponential point-process models.
          </p>
        </div>

        {/* Core Research Question Callout */}
        <div className="my-10 max-w-3xl mx-auto rounded-2xl border border-surface-border bg-surface-card/80 p-6 sm:p-8 backdrop-blur-sm relative glow-cyan">
          <div className="text-[11px] font-mono uppercase tracking-wider text-brand-cyan font-bold mb-2">
            Core Research Question
          </div>
          <blockquote className="text-sm sm:text-base text-slate-200 italic font-serif leading-relaxed">
            “How does abnormal thermal-event behaviour evolve over the observed life of a lithium-ion
            battery, and how reliably can Poisson and Exponential models describe that behaviour?”
          </blockquote>
          <div className="mt-4 pt-4 border-t border-surface-border/60 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <span>Default Threshold: <strong className="text-white">40.0°C</strong></span>
            <span>Test Chamber: <strong className="text-white">24°C Nominal</strong></span>
            <span>Cell Format: <strong className="text-white">18650 LiCoO₂ / Graphite</strong></span>
          </div>
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 my-8">
          <button
            onClick={onLaunchApp}
            className="flex items-center gap-2.5 rounded-xl bg-brand-cyan px-6 py-3.5 text-sm font-bold font-mono text-slate-950 hover:bg-cyan-300 transition shadow-lg shadow-cyan-500/20 glow-cyan"
          >
            <Cpu className="h-4 w-4" />
            <span>Launch Live Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onOpenJudgeTour}
            className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-surface-elevated px-6 py-3.5 text-sm font-semibold font-mono text-brand-cyan hover:bg-cyan-500/10 transition"
          >
            <Sparkles className="h-4 w-4 text-brand-cyan" />
            <span>Guided Judge Tour</span>
          </button>

          <button
            onClick={onOpenMethodology}
            className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-card px-5 py-3.5 text-sm font-medium font-mono text-slate-300 hover:text-white hover:bg-surface-elevated transition"
          >
            <BookOpen className="h-4 w-4 text-slate-400" />
            <span>Methodology & Equations</span>
          </button>
        </div>

        {/* Authentic Data Metrics Row */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="rounded-xl border border-surface-border bg-surface-card p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {totalCycles}
            </div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-1">
              Discharge Cycles
            </div>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-card p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-brand-cyan">
              {totalReadings.toLocaleString()}
            </div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-1">
              Sensor Telemetry Points
            </div>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-card p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">
              {lambdaRate.toFixed(2)}
            </div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-1">
              Estimated Poisson λ
            </div>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-card p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
              {dispersionIndex ? dispersionIndex.toFixed(2) : "1.00"}
            </div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-1">
              Variance-Mean Dispersion D
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-surface-border bg-surface-card p-6 hover:border-cyan-500/30 transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-brand-cyan mb-4">
              <Sliders className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Event Semantics Explorer</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Demonstrates why counting raw sensor sample exceedances creates artificial autocorrelation,
              shifting Poisson rates by &gt;40x versus physical thermal episodes with hysteresis.
            </p>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface-card p-6 hover:border-cyan-500/30 transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 mb-4">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Model Adequacy Guardrail</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Rule-based diagnostics computing Index of Dispersion (D = s²/x̄), Chi-Square goodness-of-fit,
              and Coefficient of Variation (CV) to guard against overinterpreting model probabilities.
            </p>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface-card p-6 hover:border-cyan-500/30 transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 mb-4">
              <FileCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Thermal Regime Shift Explorer</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Traces electrochemical aging across pristine, mid-life, and knee-point stages.
              Garwood confidence intervals reveal non-stationary rate divergence across the battery lifespan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
