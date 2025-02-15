"use client";

import React, { useState, useCallback, useEffect } from 'react'
import ReactFlow, { 
  addEdge, 
  applyEdgeChanges, 
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
  Panel,
  getConnectedEdges,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { FaEnvelope, FaBox, FaExclamationTriangle, FaFileInvoiceDollar } from "react-icons/fa";
import { InformationCircleIcon, BookOpenIcon, ArrowDownTrayIcon, ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Switch } from "@/components/ui/switch";

import CustomNode from '@/components/canvas/CustomNode'
import Sidebar from "@/components/canvas/Sidebar";
import EmailConfigModal from "@/components/canvas/modals/EmailConfigModal";
import ProductConfigModal from "@/components/canvas/modals/ProductConfigModal";
import { useManufacturer } from "@/hooks/useManufacturer";
import SetupProfileForm from '@/components/SetupProfileForm'
import FormView from '@/components/canvas/FormView'
import CanvasView from '@/components/canvas/CanvasView'

// Define node types
const nodeTypes = {
  customNode: CustomNode,
};

// Define valid connection rules
const connectionRules = {
  'email': ['product'], // Email can only connect to product
  'product': ['exception', 'invoice'], // Product can connect to either exception or invoice
  'exception': [], // Exception can't connect to anything (end node)
  'invoice': [], // Invoice can't connect to anything (end node)
};

// Add this near the top of the file, after the imports
const icons = {
  email: <FaEnvelope className="w-6 h-6 text-blue-500" />,
  product: <FaBox className="w-6 h-6 text-green-500" />,
  exception: <FaExclamationTriangle className="w-6 h-6 text-yellow-500" />,
  invoice: <FaFileInvoiceDollar className="w-6 h-6 text-purple-500" />
};

export default function Page() {
  // 1. Session and routing hooks
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { manufacturer, isLoading: isLoadingManufacturer } = useManufacturer();

  // 2. State hooks
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isValidFlow, setIsValidFlow] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormView, setIsFormView] = useState(false);

  // 3. Callback hooks
  const onNodesChange = useCallback((changes) => {
    // Handle node deletion
    const deletions = changes.filter(change => change.type === 'remove');
    if (deletions.length > 0) {
      setEdges(edges => {
        const remainingEdges = edges.filter(edge => {
          // Remove any edges connected to the deleted nodes
          return !deletions.some(deletion => 
            deletion.id === edge.source || deletion.id === edge.target
          );
        });
        return remainingEdges;
      });
    }
    
    // Apply other node changes
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((params) => {
    const sourceNode = nodes.find(node => node.id === params.source);
    const targetNode = nodes.find(node => node.id === params.target);
    
    if (sourceNode && targetNode) {
      const sourceType = sourceNode.data.type.toLowerCase();
      const targetType = targetNode.data.type.toLowerCase();
      
      if (connectionRules[sourceType]?.includes(targetType)) {
        const newEdge = {
          ...params,
          id: `edge-${params.source}-${params.target}-${crypto.randomUUID()}`,
          type: 'smoothstep',
        };
        setEdges((eds) => addEdge(newEdge, eds));
      }
    }
  }, [nodes]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      const reactFlowBounds = document.querySelector(".react-flow").getBoundingClientRect();
      const { manufacturer } = useManufacturer();

      const position = {
        x: event.clientX - reactFlowBounds.left - 90,
        y: event.clientY - reactFlowBounds.top - 20,
      };

      const newNode = {
        id: `${type}-${Date.now()}`,
        type: "customNode",
        position,
        data: {
          type: type,
          label: type.charAt(0).toUpperCase() + type.slice(1),
          configured: false,
          manufacturer_id: manufacturer?.id,
          config: {}
        },
      };

      console.log("Creating new node:", newNode);

      setNodes((prevNodes) => {
        const updatedNodes = [...prevNodes, newNode];
        return updatedNodes;
      });
    },
    [setNodes]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setIsConfigOpen(true);
  }, []);

  // 4. Effect hooks
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        const response = await fetch('/api/workflows', {
          credentials: 'same-origin',
        });
        const data = await response.json();
  
        if (data.workflow_nodes && data.workflow_nodes.length > 0) {
          const loadedNodes = data.workflow_nodes.map(node => {
            console.log("Loading node:", node); // Debug log
            return {
              id: node.id.toString(),
              type: 'customNode',
              position: { 
                x: parseFloat(node.position_x), 
                y: parseFloat(node.position_y) 
              },
              data: {
                type: node.config.type || node.type, // Fallback to node.type if not in config
                label: node.config.label || (node.type.charAt(0).toUpperCase() + node.type.slice(1)),
                configured: node.config.configured || false,
                ...node.config // Spread the rest of the config
              }
            };
          });
          console.log("Loaded nodes:", loadedNodes); // Debug log
          setNodes(loadedNodes);
        }
  
        if (data.workflow_edges && data.workflow_edges.length > 0) {
          setEdges(
            data.workflow_edges.map(edge => ({
              id: edge.id.toString(),
              source: edge.source_node_id.toString(),
              target: edge.target_node_id.toString(),
              type: 'smoothstep'
            }))
          );
        }
      } catch (error) {
        console.error('Failed to load workflow:', error);
        toast.error("Failed to load workflow");
      }
    };
  
    if (user) {
      loadWorkflow();
    }
  }, [user]);
  const validateAndSaveWorkflow = async () => {
    setIsSaving(true);
    try {
      console.log("Sending nodes:", nodes);
      console.log("Sending edges:", edges);

      // Prepare workflow data
      const workflowData = {
        workflow_nodes: nodes.map(node => ({
          id: node.id,
          type: node.data.type,
          position_x: node.position.x,
          position_y: node.position.y,
          config: {
            ...node.data,
            type: node.data.type,
            label: node.data.label,
            manufacturer_id: node.data.manufacturer_id
          }
        })),
        workflow_edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target
        })),
        is_valid: true
      };

      console.log("Sending workflow data:", workflowData);

      const response = await fetch('/api/workflows', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workflowData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Save workflow error:", errorData);
        throw new Error(errorData.error || 'Failed to save workflow');
      }

      const savedData = await response.json();
      console.log("Received saved data:", savedData);

      // Update local state with saved data
      if (savedData.workflow_nodes) {
        setNodes(savedData.workflow_nodes.map(node => ({
          id: node.id.toString(),
          type: 'customNode',
          position: { 
            x: parseFloat(node.position_x), 
            y: parseFloat(node.position_y) 
          },
          data: node.config
        })));
      }

      if (savedData.workflow_edges && savedData.workflow_edges.length > 0) {
        // Add null check for source_node_id and target_node_id
        setEdges(savedData.workflow_edges
          .filter(edge => edge.source_node_id && edge.target_node_id)
          .map(edge => ({
            id: edge.id.toString(),
            source: edge.source_node_id.toString(),
            target: edge.target_node_id.toString(),
            type: 'smoothstep'
          }))
        );
      }

      toast.success("Workflow saved successfully!");
      setIsValidFlow(true);
    } catch (error) {
      console.error('Failed to save workflow:', error);
      toast.error(error.message || "Failed to save workflow");
    } finally {
      setIsSaving(false);
    }
  };

  // Add these functions before the return statement
  const handleConfigSave = (nodeId, configData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...configData,
              configured: true,
              label: configData.label || node.data.label,
              productCount: configData.products?.length || 0,
              ruleCount: configData.exceptions?.length || 0
            },
          };
        }
        return node;
      })
    );
    setIsConfigOpen(false);
  };

  const renderConfigModal = () => {
    if (!selectedNode || !isConfigOpen) return null;

    const props = {
      isOpen: isConfigOpen,
      onClose: () => setIsConfigOpen(false),
      onSave: (data) => handleConfigSave(selectedNode.id, data),
      initialData: selectedNode.data,
    };

    switch (selectedNode.data.type) {
      case "email":
        return <EmailConfigModal {...props} />;
      case "product":
        return <ProductConfigModal {...props} />;
      default:
        return null;
    }
  };

  // Optional: Add a keyboard shortcut for deletion
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        setNodes(nodes => nodes.filter(node => !node.selected));
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleAddNode = (nodeData) => {
    const newNode = {
      id: `${nodeData.type}-${Date.now()}`,
      type: "customNode",
      position: { x: 100, y: 100 }, // Default position
      data: {
        type: nodeData.type,
        label: nodeData.label,
        configured: false,
        manufacturer_id: manufacturer?.id
      },
    };

    setNodes((prevNodes) => [...prevNodes, newNode]);
  };

  if (!isLoaded || isLoadingManufacturer) {
    return <div>Loading...</div>;
  }

  if (!manufacturer) {
    return (
      <div className="flex items-center justify-center h-screen">
        <SetupProfileForm />
      </div>
    );
  }

  // 5. Render
  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
        {/* Left side */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <a 
                href="/docs" 
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                target="_blank"
              >
                <BookOpenIcon className="w-5 h-5" />
              </a>
            </TooltipTrigger>
            <TooltipContent>Documentation</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Center - View Toggle */}
        <div className="flex items-center space-x-3">
          <span className={`text-sm ${!isFormView ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Canvas</span>
          <Switch
            id="view-mode"
            checked={isFormView}
            onCheckedChange={() => setIsFormView(!isFormView)}
            className="data-[state=checked]:bg-blue-600"
          />
          <span className={`text-sm ${isFormView ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Form</span>
        </div>

        {/* Right side */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={validateAndSaveWorkflow}
                size="sm"
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save workflow</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </header>
      
      <div className="flex-1">
        {isFormView ? (
          <FormView 
            nodes={nodes} 
            onSave={handleConfigSave}
            onAddNode={handleAddNode}
            onSaveWorkflow={validateAndSaveWorkflow}
          />
        ) : (
          <CanvasView
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            isValidFlow={isValidFlow}
            nodeTypes={nodeTypes}
          />
        )}
      </div>
    </div>
  );
}

const renderConfigForm = (node) => {
  const commonProps = {
    onSave: (data) => {
      handleConfigSave(node.id, data);
      setSelectedNode(null); // Clear selection after save
    },
    initialData: node.data,
    isFormView: true // Add this prop to indicate form view mode
  };

  switch (node.data.type) {
    case "email":
      return <EmailConfigModal {...commonProps} />;
    case "product":
      return <ProductConfigModal {...commonProps} />;
    case "exception":
      return <ExceptionConfigModal {...commonProps} />;
    case "invoice":
      return <InvoiceConfigModal {...commonProps} />;
    default:
      return <div>Select a configuration step to begin</div>;
  }
};
