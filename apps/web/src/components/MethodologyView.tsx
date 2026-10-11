"use client";

import React from "react";
import { BookOpen, ExternalLink } from "lucide-react";

export const MethodologyView: React.FC = () => {
  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-5 shadow-card">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase mb-2">
          <BookOpen className="h-4 w-4" /> Methodology & Documentation
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono">
          Scientific Foundations & Analytical Architecture
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-400 font-mono">
          Peer-reviewable statistical methodology, mathematical formulations, experimental provenance,
          and authoritative citations behind ThermoScope.
        </p>
      </div>

      {/* Equations Section */}
      <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-5 shadow-card space-y-4">
        <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider pb-2 border-b border-[#1f1f1f]">
          1. Point-Process Formulations & Mathematical Models
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-[#121212] border border-white/5 space-y-2">
            <span className="text-cyan-400 font-bold block">A. Poisson Distribution (Cycle Frequency)</span>
            <p className="text-gray-300">
              For event count X ~ Poisson(λ_P) per discharge cycle:
            </p>
            <div className="p-2 rounded bg-[#070707] text-white border border-white/5">
              λ̂_P = (1/n) · ∑ X_i
            </div>
            <div className="p-2 rounded bg-[#070707] text-white border border-white/5">
              P(X = k) = e^-λ · (λ^k / k!)
            </div>
            <p className="text-gray-500 text-[10px]">
              Survival function: P(X ≥ k) = 1 - CDF(k - 1)
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#121212] border border-white/5 space-y-2">
            <span className="text-purple-400 font-bold block">B. Exponential Model (Inter-Event Waiting)</span>
            <p className="text-gray-300">
              For continuous waiting time T ~ Exp(λ_E) between distinct episodes:
            </p>
            <div className="p-2 rounded bg-[#070707] text-white border border-white/5">
              λ̂_E = 1 / x̄_T, &nbsp; E[T] = x̄_T
            </div>
            <div className="p-2 rounded bg-[#070707] text-white border border-white/5">
              f(t) = λ_E · e^-λ_E·t, &nbsp; S(t) = e^-λ_E·t
            </div>
            <p className="text-gray-500 text-[10px]">
              Coefficient of Variation: CV = s_T / x̄_T (CV = 1.0 under true memorylessness)
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#121212] border border-white/5 space-y-2">
            <span className="text-amber-400 font-bold block">C. Variance-to-Mean Dispersion Index</span>
            <p className="text-gray-300">
              Tests the Poisson equidispersion property Var(X) = E[X]:
            </p>
            <div className="p-2 rounded bg-[#070707] text-white border border-white/5">
              D = s² / x̄
            </div>
            <p className="text-gray-500 text-[10px]">
              D &gt; 1.3: Overdispersed (clustering) • D &lt; 0.8: Underdispersed (regular)
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#121212] border border-white/5 space-y-2">
            <span className="text-emerald-400 font-bold block">D. Exact Garwood Confidence Intervals</span>
            <p className="text-gray-300">
              Exact fiducial limits using Chi-Square distribution percentiles (Garwood, 1936):
            </p>
            <div className="p-2 rounded bg-[#070707] text-white border border-white/5">
              λ_lower = χ²(2S, α/2) / (2n)
            </div>
            <div className="p-2 rounded bg-[#070707] text-white border border-white/5">
              λ_upper = χ²(2(S+1), 1 - α/2) / (2n)
            </div>
          </div>
        </div>
      </div>

      {/* NASA B0005 Experimental Context */}
      <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-5 shadow-card space-y-3">
        <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider pb-2 border-b border-[#1f1f1f]">
          2. NASA B0005 Experimental Test Protocol
        </h3>
        <p className="text-xs text-gray-400 font-mono leading-relaxed">
          The benchmark dataset was generated at the NASA Ames Prognostics Center of Excellence (PCoE)
          under controlled room temperature (24°C nominal) on a commercial 18650 cylindrical cell:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-gray-300">
          <li className="p-2 rounded bg-[#121212]">
            <strong className="text-white">Nominal Capacity:</strong> 2.0 Ah
          </li>
          <li className="p-2 rounded bg-[#121212]">
            <strong className="text-white">Discharge Current:</strong> Constant Current (CC) 2.0 A (1C rate)
          </li>
          <li className="p-2 rounded bg-[#121212]">
            <strong className="text-white">End-of-Life Cutoff:</strong> 2.7 V cutoff
          </li>
          <li className="p-2 rounded bg-[#121212]">
            <strong className="text-white">Thermocouple:</strong> Affixed to cell casing midpoint
          </li>
          <li className="p-2 rounded bg-[#121212]">
            <strong className="text-white">Sampling Interval:</strong> ~10 to 12 seconds
          </li>
          <li className="p-2 rounded bg-[#121212]">
            <strong className="text-white">Degradation Span:</strong> 168 complete discharge runs (35% capacity fade)
          </li>
        </ul>
      </div>

      {/* Authoritative Citations */}
      <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-5 shadow-card space-y-3">
        <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider pb-2 border-b border-[#1f1f1f]">
          3. Primary Authoritative Citations
        </h3>
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-lg bg-[#121212] flex items-start justify-between gap-3 font-mono">
            <div>
              <strong className="text-white block font-mono">
                NASA Ames Li-ion Battery Aging Dataset (B0005)
              </strong>
              <p className="text-gray-400 mt-0.5 text-[11px]">
                Saha, B., &amp; Goebel, K. (2007). <em>Battery Data Set</em>, NASA Ames Prognostics Data
                Repository, Moffett Field, CA.
              </p>
            </div>
            <a
              href="https://data.nasa.gov/dataset/li-ion-battery-aging-datasets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline shrink-0 flex items-center gap-1 font-mono text-[11px]"
            >
              <span>data.nasa.gov</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="p-3 rounded-lg bg-[#121212] flex items-start justify-between gap-3 font-mono">
            <div>
              <strong className="text-white block font-mono">
                NIST/SEMATECH e-Handbook of Statistical Methods
              </strong>
              <p className="text-gray-400 mt-0.5 text-[11px]">
                National Institute of Standards and Technology. Sections 1.3.6.6 (Poisson Distribution),
                1.3.6.7 (Exponential Distribution), 8.4.2 (Reliability Modeling).
              </p>
            </div>
            <a
              href="https://www.itl.nist.gov/div898/handbook/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline shrink-0 flex items-center gap-1 font-mono text-[11px]"
            >
              <span>nist.gov</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="p-3 rounded-lg bg-[#121212] flex items-start justify-between gap-3 font-mono">
            <div>
              <strong className="text-white block font-mono">SciPy Statistical Distributions (scipy.stats)</strong>
              <p className="text-gray-400 mt-0.5 text-[11px]">
                Virtanen, P. et al. (2020). <em>SciPy 1.0: Fundamental Algorithms for Scientific Computing</em>,
                Nature Methods, 17, 261–272.
              </p>
            </div>
            <a
              href="https://docs.scipy.org/doc/scipy/reference/stats.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline shrink-0 flex items-center gap-1 font-mono text-[11px]"
            >
              <span>scipy.org</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
