'use client'

import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  Panel 
} from 'reactflow'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function CanvasView({ 
  nodes, 
  edges, 
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDrop,
  onDragOver,
  onNodeClick,
  isValidFlow,
  nodeTypes 
}) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      deleteKeyCode={['Backspace', 'Delete']}
      fitView
      className="bg-gray-50"
    >
      <Background color="#aaa" gap={16} />
      <Controls />
      <MiniMap
        nodeStrokeColor={(n) => {
          if (n.type === "input") return "#0041d0"
          if (n.type === "output") return "#ff0072"
          return "#eee"
        }}
        nodeColor={(n) => n.type === "customNode" ? "#fff" : "#fff"}
      />
      <Panel position="top-right" className="bg-white p-4 rounded-lg shadow-lg">
        <h3 className="text-sm font-medium mb-2">Flow Statistics</h3>
        <div className="text-xs text-gray-500">
          <p>Nodes: {nodes.length}</p>
          <p>Connections: {edges.length}</p>
        </div>
      </Panel>
      <Panel position="top-left" className="bg-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <Badge variant={isValidFlow ? "success" : "error"}>
            {isValidFlow ? "Valid Workflow" : "Configuration Needed"}
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  Validate Flow
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Validate your workflow configuration</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </Panel>
    </ReactFlow>
  )
} 