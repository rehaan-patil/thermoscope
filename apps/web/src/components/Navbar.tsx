"use client";

import React from "react";
import { Flame, Sparkles, BookOpen, LayoutDashboard } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenJudgeTour: () => void;
  mode: "reading" | "episode";
  setMode?: (mode: "reading" | "episode") => void;
  threshold: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenJudgeTour,
  mode,
  threshold,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1a1a1a] bg-[#000000]/90 backdrop-blur-xl">
      <div className="flex h-14 w-full items-center justify-between px-4 sm:px-6">
        {/* Brand & Workspace indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("landing")}
            className="flex items-center gap-2.5 transition hover:opacity-90"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0a0a0a] border border-[#222222] text-cyan-400 shadow-sm shadow-cyan-500/10">
              <Flame className="h-4 w-4" />
            </div>
            <div className="text-left">
              <span className="font-mono text-sm font-bold tracking-tight text-white">
                Thermo<span className="text-cyan-400">Scope</span>
              </span>
            </div>
          </button>

          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-[#1f1f1f]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] text-gray-400">
              NASA Ames B0005 • 18650 CC 2.0A
            </span>
          </div>
        </div>

        {/* Center Pill: Analytical Mode State Indicator */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/5 bg-[#0a0a0a] px-3 py-1 text-xs font-mono">
          <span className="text-gray-500">Mode:</span>
          <span className={mode === "episode" ? "text-cyan-400 font-bold" : "text-amber-400 font-bold"}>
            {mode === "episode" ? "Physical Episodes" : "Sample Exceedances"}
          </span>
          <span className="text-[#333333]">|</span>
          <span className="text-gray-500">Threshold:</span>
          <span className="text-white font-bold">{threshold.toFixed(1)}°C</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Guided Judge Tour Button */}
          <button
            onClick={onOpenJudgeTour}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-3 py-1.5 text-xs font-mono font-medium text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition glow-cyan"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Guided</span> Tour
          </button>

          {/* Quick Landing vs App Toggle */}
          <button
            onClick={() => setActiveTab(activeTab === "landing" ? "overview" : "landing")}
            className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-[#0e0e0e] px-3 py-1.5 text-xs font-mono text-gray-300 hover:text-white hover:border-[#333333] transition"
          >
            {activeTab === "landing" ? (
              <>
                <LayoutDashboard className="h-3.5 w-3.5 text-cyan-400" />
                <span>Console</span>
              </>
            ) : (
              <>
                <BookOpen className="h-3.5 w-3.5 text-gray-400" />
                <span>Overview</span>
              </>
            )}
          </button>

          {/* GitHub link */}
          <a
            href="https://github.com/rehaan-patil/thermoscope"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/5 bg-[#0e0e0e] p-2 text-gray-400 hover:text-white hover:border-[#333333] transition"
            title="View Source on GitHub"
          >
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
};
