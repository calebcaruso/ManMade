'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  ShieldCheck, Cpu, Activity, Flame, LayoutDashboard, GitGraph, 
  Plus, X, Search, Filter, CheckCircle2, AlertCircle, Loader2 
} from 'lucide-react';
import { GraphExplorer } from '../components/GraphExplorer';

interface Artifact {
  id: string;
  title: string;
  pillar: string;
  agency: string;
  epoch: string;
  human_ratio: number;
  created_at?: string;
}

const HISTORICAL_TIMELINE_DATA = [
  { epoch: 'Stone Age', humanRatio: 100, syntheticInfiltration: 0 },
  { epoch: 'Bronze Age', humanRatio: 100, syntheticInfiltration: 0 },
  { epoch: 'Industrial Era', humanRatio: 85, syntheticInfiltration: 15 },
  { epoch: 'Information Age', humanRatio: 70, syntheticInfiltration: 30 },
  { epoch: '2022 (GenAI)', humanRatio: 60, syntheticInfiltration: 40 },
  { epoch: '2026 (Present)', humanRatio: 52, syntheticInfiltration: 48 },
];

const ALL_PILLARS = [
  'Architectural',
  'Textiles',
  'Ceramics',
  'Metalwork',
  'Literary',
  'Visual Arts',
  'Digital Synthesis'
];

const AGENCIES = [
  'Pure Human',
  'Human-Assisted Tool',
  'Machine Automated',
  'Synthetic AI'
];

const AGENCY_COLORS: Record<string, string> = {
  'Pure Human': '#f59e0b',
  'Human-Assisted Tool': '#d97706',
  'Machine Automated': '#64748b',
  'Synthetic AI': '#06b6d4',
};

export default function AncestralLedgerApp() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'graph'>('analytics');
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPillarFilter, setSelectedPillarFilter] = useState<string>('ALL');
  const [selectedAgencyFilter, setSelectedAgencyFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    title: '',
    pillar: ALL_PILLARS[0],
    agency: AGENCIES[0],
    epoch: '2026 (Present)',
    human_ratio: 100,
  });

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch full dataset from Supabase
  const loadSupabaseData = async () => {
    const { data, error } = await supabase
      .from('artifacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setArtifacts(data as Artifact[]);
    } else if (error) {
      showToast('Failed to connect to ledger database', 'error');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadSupabaseData();

    // Setup Supabase Realtime Subscription
    const channel = supabase
      .channel('realtime-artifacts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'artifacts' },
        () => {
          loadSupabaseData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Submit Handler
  const handleCreateArtifact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Please enter an artifact title', 'error');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('artifacts').insert([
      {
        title: formData.title.trim(),
        pillar: formData.pillar,
        agency: formData.agency,
        epoch: formData.epoch.trim(),
        human_ratio: Number(formData.human_ratio),
      },
    ]);

    if (!error) {
      setFormData({
        title: '',
        pillar: ALL_PILLARS[0],
        agency: AGENCIES[0],
        epoch: '2026 (Present)',
        human_ratio: 100,
      });
      setIsModalOpen(false);
      showToast('Artifact successfully registered to ledger!');
    } else {
      showToast(`Registration failed: ${error.message}`, 'error');
    }
    setIsSubmitting(false);
  };

  // Filter Logic
  const filteredArtifacts = artifacts.filter((a) => {
    const matchesSearch = 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.epoch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPillar = selectedPillarFilter === 'ALL' || a.pillar === selectedPillarFilter;
    const matchesAgency = selectedAgencyFilter === 'ALL' || a.agency === selectedAgencyFilter;
    
    return matchesSearch && matchesPillar && matchesAgency;
  });

  // Dynamic KPI Calculations (Based on Filtered Records)
  const totalArtifacts = filteredArtifacts.length;
  const syntheticCount = filteredArtifacts.filter(a => a.agency === 'Synthetic AI').length;
  const syntheticPercentage = totalArtifacts > 0 ? ((syntheticCount / totalArtifacts) * 100).toFixed(1) : '0';
  
  const avgHumanRatio = totalArtifacts > 0
    ? (filteredArtifacts.reduce((acc, curr) => acc + Number(curr.human_ratio || 0), 0) / totalArtifacts).toFixed(1)
    : '0';

  const coveredPillarsCount = new Set(filteredArtifacts.map(a => a.pillar)).size;

  // Dynamic 7-Pillar Bar Chart Data
  const pillarChartData = ALL_PILLARS.map(pillarName => {
    const matching = filteredArtifacts.filter(a => a.pillar === pillarName);
    const human = matching.filter(a => a.agency !== 'Synthetic AI').length;
    const synthetic = matching.filter(a => a.agency === 'Synthetic AI').length;
    return {
      pillar: pillarName,
      human,
      synthetic,
    };
  });

  // Dynamic Agency Pie Chart Data
  const agencyPieData = AGENCIES.map(agencyName => {
    const count = filteredArtifacts.filter(a => a.agency === agencyName).length;
    return {
      name: agencyName,
      value: count,
      color: AGENCY_COLORS[agencyName],
    };
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-8 space-y-6 font-sans relative">
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl transition-all duration-300 ${
          toast.type === 'error' 
            ? 'bg-rose-950/90 border-rose-800 text-rose-200' 
            : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          <span className="text-xs font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-500" />
            Ancestral Ledger: Provenance & 7-Pillar Analytics
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time audit distribution of authentic human endeavor vs. synthetic AI artifacts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-4 h-4" /> Register Artifact
          </button>

          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 font-medium text-xs">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'analytics' ? 'bg-zinc-800 text-amber-500 font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Analytics View
            </button>
            <button
              onClick={() => setActiveTab('graph')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'graph' ? 'bg-zinc-800 text-amber-500 font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <GitGraph className="w-4 h-4" /> Graph Explorer
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      {activeTab === 'analytics' && (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/80">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search ledger by title or epoch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </div>
            
            <select
              value={selectedPillarFilter}
              onChange={(e) => setSelectedPillarFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Pillars</option>
              {ALL_PILLARS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <select
              value={selectedAgencyFilter}
              onChange={(e) => setSelectedAgencyFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Agencies</option>
              {AGENCIES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            {(searchQuery || selectedPillarFilter !== 'ALL' || selectedAgencyFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedPillarFilter('ALL');
                  setSelectedAgencyFilter('ALL');
                }}
                className="text-xs text-amber-500 hover:underline px-2"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' ? (
        <div className="space-y-8">
          {/* Live KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { 
                label: 'Verified Database Records', 
                value: isLoading ? '...' : totalArtifacts.toLocaleString(), 
                sub: searchQuery || selectedPillarFilter !== 'ALL' ? 'Filtered Query' : 'Live Supabase Query', 
                icon: ShieldCheck, 
                color: 'text-amber-500' 
              },
              { 
                label: 'Synthetic Models Registered', 
                value: isLoading ? '...' : syntheticCount.toLocaleString(), 
                sub: `${syntheticPercentage}% Filtered Total`, 
                icon: Cpu, 
                color: 'text-cyan-500' 
              },
              { 
                label: 'Avg Human Touch Ratio', 
                value: isLoading ? '...' : `${avgHumanRatio}%`, 
                sub: 'Live calculation across records', 
                icon: Activity, 
                color: 'text-emerald-500' 
              },
              { 
                label: 'Pillar Coverage', 
                value: isLoading ? '...' : `${coveredPillarsCount} / 7`, 
                sub: 'Active Material Culture Pillars', 
                icon: Flame, 
                color: 'text-purple-500' 
              },
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

          {/* Live Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pillar Bar Chart */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
              <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center justify-between">
                <span>7-Pillar Distribution: Dynamic Database Query</span>
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pillarChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="pillar" stroke="#71717a" fontSize={10} />
                    <YAxis stroke="#71717a" fontSize={10} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', fontSize: '12px' }} />
                    <Bar dataKey="human" name="Human Craft" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="synthetic" name="Synthetic AI" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Creation Agency Pie Chart */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
              <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center justify-between">
                <span>Creation Agency Composition</span>
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={agencyPieData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={60} 
                      outerRadius={90} 
                      paddingAngle={4} 
                      dataKey="value"
                    >
                      {agencyPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Temporal Timeline Chart */}
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
        <GraphExplorer />
      )}

      {/* Artifact Ingestion Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                Ingest New Artifact
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateArtifact} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Artifact Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hand-carved Wooden Stool"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Pillar</label>
                  <select
                    value={formData.pillar}
                    onChange={(e) => setFormData({ ...formData, pillar: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    {ALL_PILLARS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Agency</label>
                  <select
                    value={formData.agency}
                    onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    {AGENCIES.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Epoch / Date</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026 (Present) or Bronze Age"
                  value={formData.epoch}
                  onChange={(e) => setFormData({ ...formData, epoch: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-zinc-400 mb-1">
                  <span>Human Ratio</span>
                  <span className="text-amber-500 font-mono">{formData.human_ratio}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.human_ratio}
                  onChange={(e) => setFormData({ ...formData, human_ratio: Number(e.target.value) })}
                  className="w-full accent-amber-500 bg-zinc-950 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isSubmitting ? 'Saving...' : 'Submit Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
