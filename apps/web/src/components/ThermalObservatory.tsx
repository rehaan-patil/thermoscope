"use client";

import React, { useState } from "react";
import { FullAnalysisResponse, CycleDataPoint } from "@/types/thermoscope";
import { Eye } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

interface ThermalObservatoryProps {
  data: FullAnalysisResponse;
}

export const ThermalObservatory: React.FC<ThermalObservatoryProps> = ({ data }) => {
  const { cycles, options } = data;
  const [selectedCycle, setSelectedCycle] = useState<CycleDataPoint>(cycles[cycles.length - 1]);

  const chartData = cycles.map((c) => ({
    cycle: c.cycle,
    maxTemp: c.max_temperature,
    meanTemp: c.mean_temperature,
    minTemp: c.min_temperature,
    events: c.event_count,
    readingEvents: c.reading_count,
    episodeEvents: c.episode_count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-6">
        <div className="flex items-center gap-2 text-brand-cyan text-xs font-mono font-bold uppercase mb-2">
          <Eye className="h-4 w-4" /> Thermal Observatory
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Thermal Trajectory & Cycle Telemetry
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          Tracking temperature envelopes across all {cycles.length} discharge cycles of NASA Cell B0005.
          Threshold line overlay at {options.threshold.toFixed(1)}°C.
        </p>
      </div>

      {/* Main Temperature Chart */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">
              Cycle Temperature Extremes (Min, Mean, Peak)
            </h3>
            <p className="text-xs text-slate-400">
              Degradation causes surface temperatures to cross the {options.threshold}°C project threshold in later cycles.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-brand-cyan">
              <span className="h-2 w-2 rounded-full bg-brand-cyan" /> Max Temp
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="h-0.5 w-3 bg-amber-400" /> Threshold ({options.threshold}°C)
            </span>
            <span className="flex items-center gap-1.5 text-red-500">
              <span className="h-0.5 w-3 bg-red-500" /> Critical (43.0°C)
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  const clickedCycle = e.activePayload[0].payload.cycle;
                  const found = cycles.find((c) => c.cycle === clickedCycle);
                  if (found) setSelectedCycle(found);
                }
              }}
            >
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="cycle" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis domain={[22, 44]} stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d121c",
                  borderColor: "#1e293b",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <ReferenceLine y={options.threshold} stroke="#f59e0b" strokeDasharray="4 4" />
              <ReferenceLine y={43.0} stroke="#ef4444" strokeDasharray="2 2" />
              <Area
                type="monotone"
                dataKey="maxTemp"
                stroke="#00e5ff"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#tempGradient)"
                name="Max Temp (°C)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Events By Cycle Bar Chart & Cycle Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events Count Bar Chart */}
        <div className="lg:col-span-2 rounded-xl border border-surface-border bg-surface-card p-6">
          <h3 className="text-sm font-bold text-white mb-1">
            Abnormal Thermal Events by Cycle ({options.mode === "episode" ? "Episodes" : "Readings"})
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Notice how early cycles (1–50) generate zero events, while late cycles undergo clustered thermal excursions.
          </p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    const clickedCycle = e.activePayload[0].payload.cycle;
                    const found = cycles.find((c) => c.cycle === clickedCycle);
                    if (found) setSelectedCycle(found);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="cycle" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d121c",
                    borderColor: "#1e293b",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="events"
                  fill={options.mode === "episode" ? "#00e5ff" : "#f59e0b"}
                  radius={[2, 2, 0, 0]}
                  name="Events"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Selected Cycle Inspector */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <span className="text-xs font-mono text-slate-400 uppercase">Cycle Inspector</span>
              <span className="font-mono text-xs font-bold text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded border border-brand-cyan/30">
                Cycle #{selectedCycle.cycle}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded bg-surface-elevated">
                <span className="text-slate-400">Peak Temperature:</span>
                <span
                  className={`font-bold ${
                    selectedCycle.max_temperature >= 40.0
                      ? "text-amber-400"
                      : "text-white"
                  }`}
                >
                  {selectedCycle.max_temperature.toFixed(2)}°C
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-elevated">
                <span className="text-slate-400">Mean Temperature:</span>
                <span className="font-bold text-white">
                  {selectedCycle.mean_temperature.toFixed(2)}°C
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-elevated">
                <span className="text-slate-400">Min Temperature:</span>
                <span className="font-bold text-white">
                  {selectedCycle.min_temperature.toFixed(2)}°C
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-elevated">
                <span className="text-slate-400">Distinct Episodes:</span>
                <span className="font-bold text-brand-cyan">{selectedCycle.episode_count}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-elevated">
                <span className="text-slate-400">Sample Exceedances:</span>
                <span className="font-bold text-amber-400">{selectedCycle.reading_count}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-elevated">
                <span className="text-slate-400">Discharge Duration:</span>
                <span className="font-bold text-white">
                  {selectedCycle.duration_s.toFixed(0)} s
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-surface-border text-[11px] text-slate-500 font-mono">
            Click any bar or point in the charts above to inspect its cycle telemetry.
          </div>
        </div>
      </div>
    </div>
  );
};
