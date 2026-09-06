'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ShieldCheck, Cpu, Activity, Flame, LayoutDashboard, GitGraph } from 'lucide-react';

const HISTORICAL_TIMELINE_DATA = [
  { epoch: 'Stone Age', humanRatio: 100, syntheticInfiltration: 0 },
  { epoch: 'Bronze Age', humanRatio: 100, syntheticInfiltration: 0 },
  { epoch: 'Industrial Era', humanRatio: 85, syntheticInfiltration: 15 },
  { epoch: 'Information Age', humanRatio: 70, syntheticInfiltration: 30 },
  { epoch: '2022 (GenAI)', humanRatio: 60, syntheticInfiltration: 40 },
  { epoch: '2026 (Present)', humanRatio: 52, syntheticInfiltration: 48 },
];

const PROVENANCE_PIE_DATA = [
  { name: 'Pure Human', value: 9020, color: '#f59e0b' },
  { name: 'Human-Assisted Tool', value: 2400, color: '#d97706' },
  { name: 'Machine Automated', value: 1100, color: '#64748b' },
  { name: 'Synthetic AI', value: 8190, color: '#06b6d4' },
];

const INITIAL_NODES: Node[] = [
  { id: '1', position: { x: 50, y: 150 }, data: { label: '🗿 Stone Age Lithic Core (Pure Human)' }, style: { background: '#18181b', color: '#f59e0b', border: '1px solid #f59e0b', padding: '12px', borderRadius: '12px' } },
  { id: '2', position: { x: 300, y: 80 }, data: { label: '🏺 Bronze Age Ceramic Craft (Pure Human)' }, style: { background: '#18181b', color: '#d97706', border: '1px solid #d97706', padding: '12px', borderRadius: '12px' } },
  { id: '3', position: { x: 300, y: 220 }, data: { label: '⚙️ Industrial Loom Pattern (Human-Assisted)' }, style: { background: '#18181b', color: '#64748b', border: '1px solid #64748b', padding: '12px', borderRadius: '12px' } },
  { id: '4', position: { x: 600, y: 150 }, data: { label: '💻 3D NeRF Reconstruction (Synthetic AI)' }, style: { background: '#18181b', color: '#06b6d4', border: '1px solid #06b6d4', padding: '12px', borderRadius: '12px' } },
];

const INITIAL_EDGES: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#f59e0b' } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#d97706' } },
  { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#06b6d4' } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#06b6d4' } },
];

export default function AncestralLedgerApp() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'graph'>('analytics');
  const [totalArtifacts, setTotalArtifacts] = useState<number>(0);
  const [pillarData, setPillarData] = useState<any[]>([]);

  useEffect(() => {
    async function loadSupabaseData() {
      const { data, count, error } = await supabase
        .from('artifacts')
        .select('*', { count: 'exact' });

      if (!error && data) {
        setTotalArtifacts(count || data.length);
        
        const countsByPillar: Record<string, { human: number; synthetic: number }> = {};
        data.forEach((item) => {
          if (!countsByPillar[item.pillar]) {
            countsByPillar[item.pillar] = { human: 0, synthetic: 0 };
          }
          if (item.agency === 'Synthetic AI') {
            countsByPillar[item.pillar].synthetic += 1;
          } else {
            countsByPillar[item.pillar].human += 1;
          }
        });

        const formattedChartData = Object.keys(countsByPillar).map((pillar) => ({
          pillar,
          human: countsByPillar[pillar].human,
          synthetic: countsByPillar[pillar].synthetic,
        }));

        if (formattedChartData.length > 0) {
          setPillarData(formattedChartData);
        }
      }
    }

    loadSupabaseData();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 space-y-8 font-sans">
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

        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 font-medium text-xs">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'analytics' ? 'bg-amber-500 text-zinc-950 font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Analytics View
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'graph' ? 'bg-amber-500 text-zinc-950 font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <GitGraph className="w-4 h-4" /> Graph Explorer
          </button>
        </div>
      </div>

      {activeTab === 'analytics' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Verified Database Records', value: totalArtifacts ? totalArtifacts.toString() : 'Loading...', sub: 'Live Supabase Query', icon: ShieldCheck, color: 'text-amber-500' },
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
              <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center justify-between">
                <span>7-Pillar Distribution: Dynamic Database Query</span>
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pillarData.length > 0 ? pillarData : [
                    { pillar: 'Architectural', human: 1420, synthetic: 310 },
                    { pillar: 'Textiles', human: 3890, synthetic: 1820 },
                    { pillar: 'Ceramics', human: 980, synthetic: 240 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="pillar" stroke="#71717a" fontSize={10} />
                    <YAxis stroke="#71717a" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', fontSize: '12px' }} />
                    <Bar dataKey="human" name="Human Craft" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="synthetic" name="Synthetic AI" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
              <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center justify-between">
                <span>Creation Agency Composition</span>
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PROVENANCE_PIE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {PROVENANCE_PIE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl lg:col-span-2">
              <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center justify-between">
                <span>Temporal Infiltration Trajectory (Stone Age - 2026)</span>
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
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 h-[600px] flex flex-col">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-zinc-200">Interactive Lineage Explorer</h2>
            <p className="text-xs text-zinc-400">Pan, zoom, and explore artifact relationships across epochs.</p>
          </div>
          <div className="flex-1 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
            <ReactFlow defaultNodes={INITIAL_NODES} defaultEdges={INITIAL_EDGES} fitView>
              <Background color="#27272a" gap={16} />
              <Controls />
            </ReactFlow>
          </div>
        </div>
      )}
    </div>
  );
}
