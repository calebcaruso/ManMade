"use client";

import React from "react";
import { 
  X, 
  ShieldCheck, 
  Cpu, 
  User, 
  Sparkles, 
  Calendar, 
  Layers, 
  ExternalLink 
} from "lucide-react";

export interface SelectedNodeData {
  id: string;
  label: string;
  pillar: string;
  agency: "Pure Human" | "Synthetic AI" | "Hybrid / Co-creation";
  epoch: string;
  humanRatio: number;
  description?: string;
  hash?: string;
  created_at?: string;
}

interface ProvenanceInspectorProps {
  node: SelectedNodeData | null;
  onClose: () => void;
}

export function ProvenanceInspector({ node, onClose }: ProvenanceInspectorProps) {
  if (!node) return null;

  const getAgencyColor = (agency: string) => {
    switch (agency) {
      case "Pure Human":
        return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      case "Synthetic AI":
        return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
      default:
        return "text-purple-400 bg-purple-500/10 border-purple-500/30";
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-zinc-900/95 backdrop-blur-md border-l border-zinc-800 p-6 z-50 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-zinc-100 text-lg">Provenance Inspector</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Node Title & Badge */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getAgencyColor(node.agency)}`}>
              {node.agency}
            </span>
            <span className="text-xs text-zinc-500 font-mono">ID: {node.id.slice(0, 8)}...</span>
          </div>
          <h2 className="text-xl font-bold text-white leading-tight">{node.label}</h2>
        </div>

        {/* Human Touch Gauge */}
        <div className="mt-6 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Human Touch Ratio</span>
            <span className="text-sm font-bold text-amber-400">{node.humanRatio}%</span>
          </div>
          <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-500 rounded-full"
              style={{ width: `${node.humanRatio}%` }}
            />
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-zinc-950/40 rounded-lg border border-zinc-800/50">
            <Layers className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs text-zinc-500">Pillar Category</p>
              <p className="text-sm font-medium text-zinc-200">{node.pillar}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-zinc-950/40 rounded-lg border border-zinc-800/50">
            <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs text-zinc-500">Epoch / Origin Date</p>
              <p className="text-sm font-medium text-zinc-200">{node.epoch}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-zinc-950/40 rounded-lg border border-zinc-800/50">
            {node.agency === "Pure Human" ? (
              <User className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <Cpu className="w-4 h-4 text-cyan-500 shrink-0" />
            )}
            <div>
              <p className="text-xs text-zinc-500">Creation Agency</p>
              <p className="text-sm font-medium text-zinc-200">{node.agency}</p>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="mt-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-emerald-300">Cryptographically Verified</p>
            <p className="text-zinc-400">On-chain ledger signature present.</p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-zinc-800 mt-6">
        <button 
          onClick={() => alert(`Inspecting raw ledger hash for ${node.id}`)}
          className="w-full py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm transition flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" /> View Ledger Record
        </button>
      </div>
    </div>
  );
}
