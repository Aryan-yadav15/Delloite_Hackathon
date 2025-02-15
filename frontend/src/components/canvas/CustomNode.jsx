'use client'

import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { FaEnvelope, FaBox, FaExclamationTriangle, FaFileInvoiceDollar } from 'react-icons/fa'
import EmailConfigModal from './modals/EmailConfigModal'
import ProductConfigModal from './modals/ProductConfigModal'
import ExceptionConfigModal from './modals/ExceptionConfigModal'
import InvoiceConfigModal from './modals/InvoiceConfigModal'
import { CheckCircle2 } from "lucide-react"

const icons = {
  email: <FaEnvelope className="w-5 h-5" />,
  product: <FaBox className="w-5 h-5" />,
  exception: <FaExclamationTriangle className="w-5 h-5" />,
  invoice: <FaFileInvoiceDollar className="w-5 h-5" />
}

const colors = {
  email: 'border-blue-500 bg-blue-50',
  product: 'border-green-500 bg-green-50',
  exception: 'border-yellow-500 bg-yellow-50',
  invoice: 'border-purple-500 bg-purple-50'
}

const nodeIcons = {
  email: FaEnvelope,
  product: FaBox,
  exception: FaExclamationTriangle,
  invoice: FaFileInvoiceDollar
}

const modalComponents = {
  email: EmailConfigModal,
  product: ProductConfigModal,
  exception: ExceptionConfigModal,
  invoice: InvoiceConfigModal
}

function CustomNode({ data, selected }) {
  const isValidConnection = (sourceNode, targetNode) => {
    const nodeTypes = {
      email: ['product'],
      product: ['exception', 'invoice'],
      exception: ['invoice'],
      invoice: []
    }

    return nodeTypes[sourceNode.type]?.includes(targetNode.type) || false
  }

  return (
    <div
      className={`px-4 py-2 shadow-md rounded-lg border-2 ${
        colors[data.type]
      } ${
        selected ? 'ring-2 ring-blue-400' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-gray-500 w-3 h-3"
      />
      
      <div className="flex items-center">
        <div className="mr-2 relative">
          {icons[data.type]}
          {data.configured && (
            <CheckCircle2 className="h-3 w-3 text-green-500 absolute -right-1 -top-1 bg-white rounded-full" />
          )}
        </div>
        <div>
          <div className="text-sm font-medium">{data.label}</div>
          {data.configured && (
            <div className="text-xs text-gray-500">
              {data.type === 'email' && `Tracking: ${data.email}`}
              {data.type === 'product' && `Products: ${data.productCount}`}
              {data.type === 'exception' && `Rules: ${data.ruleCount}`}
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-gray-500 w-3 h-3"
      />
    </div>
  )
}

export default memo(CustomNode) 