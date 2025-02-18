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
import Sidebar from "./Sidebar"
import { FaEnvelope, FaBox, FaExclamationTriangle, FaFileInvoiceDollar } from 'react-icons/fa'

const sidebarNodeTypes = [
  {
    type: 'email',
    label: 'Email Configuration',
    description: 'Configure email tracking settings',
    icon: <FaEnvelope className="w-6 h-6 text-blue-500" />,
    color: 'border-blue-500',
    order: 1,
    canConnect: ['product'],
    badge: 'Start Here'
  },
  {
    type: 'product',
    label: 'Product List',
    description: 'Add products to track',
    icon: <FaBox className="w-6 h-6 text-green-500" />,
    color: 'border-green-500',
    order: 2,
    canConnect: ['exception', 'invoice'],
    badge: 'Step 2'
  },
  {
    type: 'exception',
    label: 'Exception Products',
    description: 'Configure product exceptions',
    icon: <FaExclamationTriangle className="w-6 h-6 text-yellow-500" />,
    color: 'border-yellow-500',
    order: 3,
    canConnect: ['invoice']
  },
  {
    type: 'invoice',
    label: 'Invoice Template',
    description: 'Design invoice layout',
    icon: <FaFileInvoiceDollar className="w-6 h-6 text-purple-500" />,
    color: 'border-purple-500',
    order: 4,
    canConnect: []
  }
];

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
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="flex h-full">
      <Sidebar 
        nodeTypes={sidebarNodeTypes} 
        onDragStart={onDragStart}
      />
      
      <div className="flex-1">
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
      </div>
    </div>
  )
} 