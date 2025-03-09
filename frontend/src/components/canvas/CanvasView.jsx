'use client'

import React, { useState } from 'react';
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
import { FaEnvelope, FaBox, FaExclamationTriangle, FaFileInvoiceDollar, FaCodeBranch, FaPercentage, FaBell } from 'react-icons/fa'
import { CheckCircle2 } from 'lucide-react'
import WorkflowGuide from './WorkflowGuide'
import DemoWorkflow from './DemoWorkflow'

const sidebarNodeTypes = [
  {
    type: 'email',
    label: 'Email Configuration',
    description: 'Configure email tracking settings',
    icon: <FaEnvelope className="w-6 h-6 text-blue-500" />,
    color: 'border-blue-500',
    order: 1,
    canConnect: ['product', 'conditional'],
    badge: 'Start Here'
  },
  {
    type: 'product',
    label: 'Product List',
    description: 'Add products to track',
    icon: <FaBox className="w-6 h-6 text-green-500" />,
    color: 'border-green-500',
    order: 2,
    canConnect: ['exception', 'invoice', 'conditional', 'price_adjustment'],
    badge: 'Step 2'
  },
  {
    type: 'exception',
    label: 'Exception Products',
    description: 'Configure product exceptions',
    icon: <FaExclamationTriangle className="w-6 h-6 text-yellow-500" />,
    color: 'border-yellow-500',
    order: 3,
    canConnect: ['invoice', 'conditional']
  },
  {
    type: 'invoice',
    label: 'Invoice Template',
    description: 'Design invoice layout',
    icon: <FaFileInvoiceDollar className="w-6 h-6 text-purple-500" />,
    color: 'border-purple-500',
    order: 4,
    canConnect: []
  },
  {
    type: 'conditional',
    label: 'Conditional Logic',
    description: 'Add if/then branching logic',
    icon: <FaCodeBranch className="w-6 h-6 text-orange-500" />,
    color: 'border-orange-500',
    order: 5,
    canConnect: ['email', 'product', 'exception', 'invoice', 'price_adjustment', 'notification']
  },
  {
    type: 'price_adjustment',
    label: 'Price Adjustment',
    description: 'Modify pricing for products',
    icon: <FaPercentage className="w-6 h-6 text-pink-500" />,
    color: 'border-pink-500',
    order: 6,
    canConnect: ['invoice']
  },
  {
    type: 'notification',
    label: 'Notification',
    description: 'Send alerts and notifications',
    icon: <FaBell className="w-6 h-6 text-indigo-500" />,
    color: 'border-indigo-500',
    order: 7,
    canConnect: ['invoice', 'conditional']
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
  nodeTypes,
  setNodes,
  setEdges
}) {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
  
  const handleLoadDemoWorkflow = (workflow) => {
    // Load the demo workflow into the canvas
    setNodes(workflow.nodes);
    setEdges(workflow.edges);
    
    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
        <Sidebar 
          nodeTypes={sidebarNodeTypes}
          onDragStart={onDragStart}
        />
        
        <div className="mt-6">
          <WorkflowGuide />
        </div>
        
        <div className="mt-6">
          <DemoWorkflow onLoad={handleLoadDemoWorkflow} />
        </div>
      </div>
      
      <div className="flex-1 h-full relative">
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
          deleteKeyCode="Delete"
          multiSelectionKeyCode="Control"
          snapToGrid={true}
          snapGrid={[15, 15]}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          fitView
          attributionPosition="bottom-right"
          connectionLineStyle={{ stroke: '#4F46E5', strokeWidth: 2, strokeDasharray: '5,5' }}
          connectionLineType="smoothstep"
        >
          <Background color="#f8f8f8" gap={16} size={1} />
          <Controls showInteractive={false} />
          <MiniMap 
            nodeStrokeColor={(n) => {
              return '#fff';
            }}
            nodeColor={(n) => {
              if (n.data.type === 'email') return '#93C5FD';
              if (n.data.type === 'product') return '#86EFAC';
              if (n.data.type === 'exception') return '#FEF08A';
              if (n.data.type === 'invoice') return '#C4B5FD';
              if (n.data.type === 'conditional') return '#FDBA74';
              if (n.data.type === 'price_adjustment') return '#F9A8D4';
              return '#CBD5E1';
            }}
            style={{ height: 120 }}
            maskColor="rgba(240, 240, 240, 0.5)"
          />
          
          {showSuccessMessage && (
            <Panel position="top-center" className="bg-green-100 border border-green-300 p-3 rounded-md shadow-md">
              <div className="text-sm text-green-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Demo workflow loaded successfully! You can now explore and modify it.
              </div>
            </Panel>
          )}
          
          <Panel position="bottom-center" className="bg-white p-2 rounded-t-lg shadow-md border border-gray-200">
            <div className="text-xs text-gray-500">
              <strong>Tip:</strong> Drag from source handle (bottom) to target handle (top) to connect nodes
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  )
} 