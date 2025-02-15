'use client'

import { FaEnvelope, FaBox, FaExclamationTriangle, FaFileInvoiceDollar } from 'react-icons/fa'

const nodeTypes = [
  {
    type: 'email',
    label: 'Email Configuration',
    description: 'Configure email tracking settings',
    icon: <FaEnvelope className="w-6 h-6 text-blue-500" />,
    color: 'border-blue-500',
    order: 1,
    canConnect: ['product']
  },
  {
    type: 'product',
    label: 'Product List',
    description: 'Add products to track',
    icon: <FaBox className="w-6 h-6 text-green-500" />,
    color: 'border-green-500',
    order: 2,
    canConnect: ['exception', 'invoice']
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
]

export default function Sidebar() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside className="w-64 bg-white border-r p-4">
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-2">Workflow Nodes</h3>
        <p className="text-sm text-gray-500">Build your workflow in order: Email → Products → Exceptions → Invoice</p>
      </div>
      
      <div className="space-y-4">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            className={`p-4 border-l-4 ${node.color} bg-white rounded-lg shadow-sm cursor-move 
              hover:shadow-md transition-all duration-200 ease-in-out`}
            onDragStart={(e) => onDragStart(e, node.type)}
            draggable
          >
            <div className="flex items-center space-x-3">
              {node.icon}
              <div>
                <h3 className="font-medium text-gray-800">{node.label}</h3>
                <p className="text-sm text-gray-500">{node.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Workflow Rules</h3>
        <ul className="text-xs text-gray-500 space-y-2">
          <li>• Start with Email Configuration</li>
          <li>• Add Product List next</li>
          <li>• Optional: Add Exceptions</li>
          <li>• End with Invoice Template</li>
        </ul>
      </div>
    </aside>
  )
} 