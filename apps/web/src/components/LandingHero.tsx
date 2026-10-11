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
  Activity,
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
    <div className="relative overflow-hidden py-16 sm:py-24 bg-[#000000]">
      {/* Subtle Blackbox.ai background ambient aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-b from-cyan-500/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Eyebrow Pill */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0a0a0a] px-3.5 py-1 text-xs font-mono text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            RESEARCH-GRADE BATTERY THERMAL ANALYTICS
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-[#0a0a0a] px-3 py-1 text-xs font-mono text-gray-400">
            NASA Ames B0005 Li-ion Benchmark
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1]">
            Understand the signals{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
              before they become risks.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Investigating abnormal thermal excursions across lithium-ion battery lifespans using
            continuous Poisson and Exponential point-process mathematical engines.
          </p>
        </div>

        {/* Core Research Question Card - Blackbox.ai style dark card */}
        <div className="my-10 max-w-3xl mx-auto rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 sm:p-7 shadow-2xl relative">
          <div className="flex items-center justify-between pb-3 border-b border-[#1a1a1a] mb-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-2">
              <Activity className="h-3.5 w-3.5" />
              Core Research Question
            </div>
            <span className="text-[11px] font-mono text-gray-500">Formulation 1.0</span>
          </div>

          <blockquote className="text-sm sm:text-base text-gray-200 font-sans leading-relaxed">
            “How does abnormal thermal-event behaviour evolve over the observed life of a lithium-ion
            battery, and how reliably can Poisson and Exponential models describe that behaviour?”
          </blockquote>

          <div className="mt-5 pt-4 border-t border-[#1a1a1a] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-gray-400">
            <span>Threshold: <strong className="text-white font-bold">40.0°C</strong></span>
            <span>Chamber: <strong className="text-white font-bold">24°C CC 2.0A</strong></span>
            <span>Cell: <strong className="text-white font-bold">18650 LiCoO₂ / Graphite</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 my-8">
          <button
            onClick={onLaunchApp}
            className="flex items-center gap-2.5 rounded-xl bg-cyan-400 px-6 py-3 text-xs font-bold font-mono text-black hover:bg-cyan-300 transition shadow-lg shadow-cyan-500/20 glow-cyan"
          >
            <Cpu className="h-4 w-4" />
            <span>Open Analytical Console</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onOpenJudgeTour}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0e0e0e] px-5 py-3 text-xs font-semibold font-mono text-cyan-400 hover:bg-[#141414] hover:border-cyan-500/30 transition"
          >
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>Guided Judge Tour</span>
          </button>

          <button
            onClick={onOpenMethodology}
            className="flex items-center gap-2 rounded-xl border border-white/5 bg-[#0a0a0a] px-5 py-3 text-xs font-medium font-mono text-gray-400 hover:text-white hover:bg-[#121212] transition"
          >
            <BookOpen className="h-4 w-4 text-gray-400" />
            <span>Methodology</span>
          </button>
        </div>

        {/* Monospace KPI Metrics Row */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
          <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {totalCycles}
            </div>
            <div className="text-[11px] font-mono text-gray-500 uppercase tracking-wider mt-1">
              Discharge Cycles
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400">
              {totalReadings.toLocaleString()}
            </div>
            <div className="text-[11px] font-mono text-gray-500 uppercase tracking-wider mt-1">
              Telemetry Points
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">
              {lambdaRate.toFixed(2)}
            </div>
            <div className="text-[11px] font-mono text-gray-500 uppercase tracking-wider mt-1">
              Estimated Rate λ
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
              {dispersionIndex ? dispersionIndex.toFixed(2) : "1.00"}
            </div>
            <div className="text-[11px] font-mono text-gray-500 uppercase tracking-wider mt-1">
              Dispersion Index D
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-5 hover:border-white/10 transition">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#141414] border border-[#222222] text-cyan-400 mb-3">
              <Sliders className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5 font-mono">Event Semantics Explorer</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Demonstrates why raw sample exceedances introduce sampling-clock autocorrelation,
              shifting Poisson rates by &gt;40x versus physical thermal episodes with hysteresis.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-5 hover:border-white/10 transition">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#141414] border border-[#222222] text-emerald-400 mb-3">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5 font-mono">Model Adequacy Guardrail</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Rule-based diagnostics computing Index of Dispersion (D = s²/x̄) and Coefficient of Variation
              to safeguard against overinterpreting model probabilities when assumptions fail.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-5 hover:border-white/10 transition">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#141414] border border-[#222222] text-purple-400 mb-3">
              <FileCheck className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5 font-mono">Thermal Regime Shifts</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Traces electrochemical aging across early, mid, and knee-point stages.
              Garwood confidence intervals reveal non-stationary rate divergence across the battery lifespan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
