'use client'

import { CheckCircle2, Plus } from "lucide-react"
import { FaEnvelope, FaBox, FaExclamationTriangle, FaFileInvoiceDollar } from "react-icons/fa"
import EmailConfigForm from "./forms/EmailConfigForm"
import ProductConfigForm from "./forms/ProductConfigForm"
import ExceptionConfigForm from "./forms/ExceptionConfigForm"
import InvoiceConfigForm from "./forms/InvoiceConfigForm"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const nodeTypes = [
  {
    type: 'email',
    label: 'Email Configuration',
    icon: <FaEnvelope className="w-6 h-6 text-blue-500" />
  },
  {
    type: 'product',
    label: 'Product List',
    icon: <FaBox className="w-6 h-6 text-green-500" />
  },
  {
    type: 'exception',
    label: 'Exception Products',
    icon: <FaExclamationTriangle className="w-6 h-6 text-yellow-500" />
  },
  {
    type: 'invoice',
    label: 'Invoice Template',
    icon: <FaFileInvoiceDollar className="w-6 h-6 text-purple-500" />
  }
]

export default function FormView({ nodes, onSave, onAddNode, onSaveWorkflow }) {
  const [selectedNode, setSelectedNode] = useState(null)
  const [newNodeType, setNewNodeType] = useState('')

  const handleAddNode = () => {
    if (!newNodeType) return

    const nodeType = nodeTypes.find(nt => nt.type === newNodeType)
    onAddNode({
      type: newNodeType,
      label: nodeType.label,
      configured: false
    })
    setNewNodeType('')
  }

  const renderConfigForm = (node) => {
    const commonProps = {
      onSave: (data) => {
        onSave(node.id, data)
        setSelectedNode(null)
      },
      initialData: node.data
    }

    switch (node.data.type) {
      case "email":
        return <EmailConfigForm {...commonProps} />
      case "product":
        return <ProductConfigForm {...commonProps} />
      case "exception":
        return <ExceptionConfigForm {...commonProps} />
      case "invoice":
        return <InvoiceConfigForm {...commonProps} />
      default:
        return null
    }
  }

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Steps */}
      <div className="w-64 border-r p-4 bg-white">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Configuration Steps</h3>
          <p className="text-sm text-gray-500">Build your workflow in order:</p>
          <p className="text-xs text-gray-400 mt-1">
            Email → Products → Exceptions → Invoice
          </p>
          
          {/* Add Step Section */}
          <div className="mt-4 space-y-2">
            <Select
              value={newNodeType}
              onValueChange={setNewNodeType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Add new step" />
              </SelectTrigger>
              <SelectContent>
                {nodeTypes.map((type) => (
                  <SelectItem 
                    key={type.type} 
                    value={type.type}
                    disabled={nodes.some(n => n.data.type === type.type)}
                  >
                    <div className="flex items-center gap-2">
                      {type.icon}
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAddNode} 
              disabled={!newNodeType}
              className="w-full"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Step
            </Button>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {nodes.map((node, index) => (
            <div
              key={node.id}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
                ${selectedNode?.id === node.id 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'hover:bg-gray-50'}`}
              onClick={() => setSelectedNode(node)}
            >
              <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full">
                <span className="text-sm text-gray-600">{index + 1}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {nodeTypes.find(nt => nt.type === node.data.type)?.icon}
                  <h4 className="text-sm font-medium">{node.data.label}</h4>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {node.data.configured 
                    ? node.data.type === 'email' 
                      ? `Tracking: ${node.data.email}`
                      : node.data.type === 'product'
                      ? `Products: ${node.data.productCount}`
                      : node.data.type === 'exception'
                      ? `Rules: ${node.data.ruleCount}`
                      : 'Configured'
                    : 'Not configured'}
                </p>
              </div>
              {node.data.configured && (
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content - Configuration Form */}
      <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
        {selectedNode ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {renderConfigForm(selectedNode)}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-medium text-gray-500">
              Select a configuration step from the left panel
            </h3>
          </div>
        )}
      </div>
    </div>
  )
} 