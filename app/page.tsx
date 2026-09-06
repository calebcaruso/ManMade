'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { ShieldCheck, Cpu, Database, Activity, Flame } from 'lucide-react';

const PILLAR_DISTRIBUTION_DATA = [
  { pillar: 'Architectural', human: 1420, synthetic: 310 },
  { pillar: 'Textiles', human: 3890, synthetic: 1820 },
  { pillar: 'Ceramics', human: 980, synthetic: 240 },
  { pillar: 'Metallurgy', human: 640, synthetic: 110 },
  { pillar: 'Woodwork', human: 1120, synthetic: 430 },
  { pillar: 'Agriculture', human: 450, synthetic: 80 },
  { pillar: 'Digital Replicas', human: 520, synthetic: 5200 },
];

const HISTORICAL_TIMELINE_DATA = [
  { epoch: '2022', humanRatio: 98, syntheticInfiltration: 2 },
  { epoch: '2023', humanRatio: 91, syntheticInfiltration: 9 },
  { epoch: '2024', humanRatio: 78, syntheticInfiltration: 22 },
  { epoch: '2025', humanRatio: 64, syntheticInfiltration: 36 },
  { epoch: '2026', humanRatio: 52, syntheticInfiltration: 48 },
];

const PROVENANCE_PIE_DATA = [
  { name: 'Pure Human', value: 9020, color: '#f59e0b' },
  { name: 'Human-Assisted Tool', value: 2400, color: '#d97706' },
  { name: 'Machine Automated', value: 1100, color: '#64748b' },
  { name: 'Synthetic AI', value: 8190, color: '#06b6d4' },
];

export default function AnalyticsDashboard() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 space-y-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-500" />
            Ancestral Ledger: Provenance & 7-Pillar Analytics
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time audit distribution of authentic human endeavor vs. synthetic AI artifacts.
          </p>
        </div>
        <div className="flex gap-3 font-mono text-xs">
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-zinc-300 flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-500" /> Total Nodes: <span className="font-bold text-white">20,710</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Verified Human Crafts', value: '11,420', sub: '55.1% Total Ledger', icon: ShieldCheck, color: 'text-amber-500' },
          { label: 'Synthetic Models Registered', value: '8,190', sub: '39.5% Total Ledger', icon: Cpu, color: 'text-cyan-500' },
          { label: 'Avg Human Touch Ratio', value: '84.2%', sub: 'Pure Human Filter active', icon: Activity, color: 'text-emerald-500' },
          { label: 'Pillar Coverage', value: '7 / 7', sub: '100% Material Culture Schema', icon: Flame, color: 'text-purple-500' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs text-zinc-400 font-medium">{kpi.label}</span>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold font-mono text-zinc-100">{kpi.value}</div>
              <div className="text-[11px] text-zinc-500 mt-1 font-mono">{kpi.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 7-Pillar Distribution */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center justify-between">
            <span>7-Pillar Distribution: Human vs Synthetic</span>
            <span className="text-xs font-mono text-zinc-500">Counts by Category</span>
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PILLAR_DISTRIBUTION_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="pillar" stroke="#71717a" fontSize={10} />
                <YAxis stroke="#71717a" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="human" name="Human Craft" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="synthetic" name="Synthetic AI" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Provenance Composition Pie */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center justify-between">
            <span>Creation Agency Composition</span>
            <span className="text-xs font-mono text-zinc-500">Pillar #7 Breakdown</span>
          </h3>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PROVENANCE_PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {PROVENANCE_PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Timeline Area Chart */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl lg:col-span-2">
          <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center justify-between">
            <span>Temporal Infiltration Trajectory (2022 - 2026)</span>
            <span className="text-xs font-mono text-zinc-500">% Share in Database Registrations</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HISTORICAL_TIMELINE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="epoch" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', fontSize: '12px' }} />
                <Area type="monotone" dataKey="humanRatio" name="Human Craft Ratio (%)" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                <Area type="monotone" dataKey="syntheticInfiltration" name="Synthetic AI Infiltration (%)" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
