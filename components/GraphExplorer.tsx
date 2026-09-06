"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  ReactFlow, 
  Controls, 
  Background, 
  Node, 
  Edge,
  useNodesState,
  useEdgesState 
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { supabase } from "../lib/supabase";
import { ProvenanceInspector, SelectedNodeData } from "./ProvenanceInspector";

interface Artifact {
  id: string;
  title: string;
  pillar: string;
  agency: string;
  epoch: string;
  human_ratio: number;
  created_at?: string;
}

export function GraphExplorer() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<SelectedNodeData | null>(null);

  // Helper function to color code node borders based on Agency
  const getNodeColor = (agency: string) => {
    switch (agency) {
      case "Pure Human":
        return "#f59e0b"; // Amber
      case "Synthetic AI":
        return "#06b6d4"; // Cyan
      case "Human-Assisted Tool":
        return "#d97706"; // Dark Amber
      default:
        return "#64748b"; // Slate
    }
  };

  // Convert DB artifacts into React Flow Nodes & Edges
  const fetchAndRenderGraph = async () => {
    const { data, error } = await supabase
      .from("artifacts")
      .select("*")
      .order("created_at", { ascending: true });

    if (error || !data) return;

    const artifacts = data as Artifact[];

    // Calculate grid positions dynamically for visual layout
    const generatedNodes: Node[] = artifacts.map((art, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);

      return {
        id: art.id,
        type: "default",
        data: {
          label: art.title,
          pillar: art.pillar,
          agency: art.agency,
          epoch: art.epoch,
          humanRatio: art.human_ratio,
        },
        position: { x: col * 260 + 50, y: row * 120 + 50 },
        style: {
          background: "#18181b",
          color: "#f4f4f5",
          border: `2px solid ${getNodeColor(art.agency)}`,
          borderRadius: "10px",
          padding: "12px",
          fontWeight: 600,
          fontSize: "13px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
        },
      };
    });

    // Automatically create connections between items sharing the same Pillar
    const generatedEdges: Edge[] = [];
    for (let i = 0; i < artifacts.length; i++) {
      for (let j = i + 1; j < artifacts.length; j++) {
        if (artifacts[i].pillar === artifacts[j].pillar) {
          generatedEdges.push({
            id: `e-${artifacts[i].id}-${artifacts[j].id}`,
            source: artifacts[i].id,
            target: artifacts[j].id,
            animated: true,
            style: { stroke: "#3f3f46", strokeWidth: 1.5 },
          });
        }
      }
    }

    setNodes(generatedNodes);
    setEdges(generatedEdges);
  };

  useEffect(() => {
    fetchAndRenderGraph();

    // Subscribe to Realtime updates for the Graph View
    const channel = supabase
      .channel("realtime-graph")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "artifacts" },
        () => {
          fetchAndRenderGraph();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode({
      id: node.id,
      label: (node.data.label as string) || "Untitled",
      pillar: (node.data.pillar as string) || "Visual Arts",
      agency: (node.data.agency as any) || "Pure Human",
      epoch: (node.data.epoch as string) || "2026",
      humanRatio: (node.data.humanRatio as number) ?? 100,
    });
  }, []);

  return (
    <div className="relative w-full h-[650px] bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
      >
        <Background color="#27272a" gap={20} size={1} />
        <Controls />
      </ReactFlow>

      {/* Provenance Slide-over Inspector */}
      <ProvenanceInspector 
        node={selectedNode} 
        onClose={() => setSelectedNode(null)} 
      />
    </div>
  );
}
