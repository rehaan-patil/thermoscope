"use client";

import React from "react";
import { Flame, ShieldAlert, Cpu, Sparkles, BookOpen, Sliders } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenJudgeTour: () => void;
  mode: "reading" | "episode";
  setMode: (mode: "reading" | "episode") => void;
  threshold: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenJudgeTour,
  mode,
  setMode,
  threshold,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("landing")}
            className="flex items-center gap-2.5 transition hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-brand-cyan shadow-sm">
              <Flame className="h-5 w-5" />
            </div>
            <div className="text-left">
              <span className="font-mono text-base font-bold tracking-tight text-white">
                Thermo<span className="text-brand-cyan">Scope</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                Battery Thermal Analytics
              </span>
            </div>
          </button>
        </div>

        {/* Global Controls & Mode Switcher */}
        <div className="hidden lg:flex items-center gap-2 border border-surface-border bg-surface-card rounded-lg p-1">
          <button
            onClick={() => setMode("episode")}
            className={`px-3 py-1 text-xs font-mono rounded-md transition ${
              mode === "episode"
                ? "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Episode Mode
          </button>
          <button
            onClick={() => setMode("reading")}
            className={`px-3 py-1 text-xs font-mono rounded-md transition ${
              mode === "reading"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Reading Mode
          </button>
          <div className="h-4 w-px bg-surface-border mx-1" />
          <div className="flex items-center gap-1.5 px-2 text-xs font-mono text-slate-300">
            <span className="text-slate-500">θ:</span>
            <span className="text-brand-cyan font-bold">{threshold.toFixed(1)}°C</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Guided Judge Tour Button */}
          <button
            onClick={onOpenJudgeTour}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 px-3 py-1.5 text-xs font-semibold text-brand-cyan hover:bg-cyan-500/30 transition shadow-sm glow-cyan"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Guided</span> Judge Tour
          </button>

          {/* Quick Tab Switcher */}
          <button
            onClick={() => setActiveTab(activeTab === "landing" ? "overview" : "landing")}
            className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface-elevated px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition"
          >
            {activeTab === "landing" ? (
              <>
                <Cpu className="h-3.5 w-3.5 text-brand-cyan" />
                <span>Open App</span>
              </>
            ) : (
              <>
                <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                <span>Landing</span>
              </>
            )}
          </button>

          {/* GitHub link */}
          <a
            href="https://github.com/Rehaan5823/thermoscope"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-surface-border p-2 text-slate-400 hover:text-white hover:border-slate-600 transition"
            title="View Source on GitHub"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
};
