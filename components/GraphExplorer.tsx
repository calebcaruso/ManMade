"use client";

import React, { useState, useCallback } from "react";
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
import { ProvenanceInspector, SelectedNodeData } from "./ProvenanceInspector";

const initialNodes: Node[] = [
  {
    id: "1",
    type: "default",
    data: { 
      label: "Cave Paintings (Lascaux)", 
      pillar: "Visual Arts", 
      agency: "Pure Human", 
      epoch: "Palaeolithic", 
      humanRatio: 100 
    },
    position: { x: 100, y: 100 },
    style: { background: "#18181b", color: "#f4f4f5", border: "1px solid #f59e0b", borderRadius: "8px", padding: "10px" }
  },
  {
    id: "2",
    type: "default",
    data: { 
      label: "Synthetic Codex #819", 
      pillar: "Digital Synthesis", 
      agency: "Synthetic AI", 
      epoch: "2026 (Present)", 
      humanRatio: 12 
    },
    position: { x: 400, y: 150 },
    style: { background: "#18181b", color: "#f4f4f5", border: "1px solid #06b6d4", borderRadius: "8px", padding: "10px" }
  }
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#f59e0b" } }
];

export function GraphExplorer() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<SelectedNodeData | null>(null);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode({
      id: node.id,
      label: (node.data.label as string) || "Untitled Node",
      pillar: (node.data.pillar as string) || "Visual Arts",
      agency: (node.data.agency as any) || "Pure Human",
      epoch: (node.data.epoch as string) || "2026",
      humanRatio: (node.data.humanRatio as number) ?? 100,
    });
  }, []);

  return (
    <div className="relative w-full h-[600px] bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
      >
        <Background color="#27272a" gap={16} />
        <Controls />
      </ReactFlow>

      <ProvenanceInspector 
        node={selectedNode} 
        onClose={() => setSelectedNode(null)} 
      />
    </div>
  );
}
