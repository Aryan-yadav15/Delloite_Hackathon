'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FaEnvelope, FaBox, FaExclamationTriangle, 
  FaFileInvoiceDollar, FaRandom, FaMoneyBillWave, FaBell,
  FaArrowRight, FaArrowDown, FaArrowUp, FaUserPlus, FaCrown, FaHandshake
} from 'react-icons/fa';

export default function DemoWorkflow({ onLoad }) {
  const complexWorkflow = {
    nodes: [
      {
        id: 'email-1',
        type: 'customNode',
        position: { x: 250, y: 50 },
        data: {
          type: 'email',
          label: 'Email Parser',
          configured: true,
          email: 'orders@company.com',
          manufacturer_id: '1'
        }
      },
      {
        id: 'conditional-1',
        type: 'customNode',
        position: { x: 250, y: 150 },
        data: {
          type: 'conditional',
          label: 'Sender Type Check',
          configured: true,
          conditionType: 'sender',
          conditions: [
            { field: 'from', operator: 'contains', value: 'newcustomer.com', output: 'New Customer' },
            { field: 'from', operator: 'contains', value: 'vip.com', output: 'VIP Customer' },
            { field: 'from', operator: 'contains', value: 'partner.com', output: 'Partner' }
          ],
          manufacturer_id: '1'
        }
      },
      // New Customer Branch
      {
        id: 'notification-1',
        type: 'customNode',
        position: { x: 50, y: 250 },
        data: {
          type: 'notification',
          label: 'Welcome New Customer',
          configured: true,
          notificationType: 'email',
          recipient: 'sales@company.com',
          message: 'New customer order received',
          manufacturer_id: '1'
        }
      },
      {
        id: 'product-1',
        type: 'customNode',
        position: { x: 50, y: 350 },
        data: {
          type: 'product',
          label: 'Extract Products',
          configured: true,
          productCount: 3,
          manufacturer_id: '1'
        }
      },
      {
        id: 'price-1',
        type: 'customNode',
        position: { x: 50, y: 450 },
        data: {
          type: 'price_adjustment',
          label: 'New Customer Price',
          configured: true,
          adjustmentType: 'percentage',
          value: 10,
          adjustment: 'increase',
          manufacturer_id: '1'
        }
      },
      {
        id: 'invoice-1',
        type: 'customNode',
        position: { x: 50, y: 550 },
        data: {
          type: 'invoice',
          label: 'Generate Invoice',
          configured: true,
          template: 'standard',
          manufacturer_id: '1'
        }
      },
      
      // VIP Customer Branch
      {
        id: 'product-2',
        type: 'customNode',
        position: { x: 250, y: 250 },
        data: {
          type: 'product',
          label: 'Extract VIP Products',
          configured: true,
          productCount: 5,
          manufacturer_id: '1'
        }
      },
      {
        id: 'price-2',
        type: 'customNode',
        position: { x: 250, y: 350 },
        data: {
          type: 'price_adjustment',
          label: 'VIP Discount',
          configured: true,
          adjustmentType: 'percentage',
          value: 15,
          adjustment: 'decrease',
          manufacturer_id: '1'
        }
      },
      {
        id: 'conditional-2',
        type: 'customNode',
        position: { x: 250, y: 450 },
        data: {
          type: 'conditional',
          label: 'Order Value Check',
          configured: true,
          conditionType: 'order_value',
          conditions: [
            { field: 'order_total', operator: 'greater_than', value: '1000', output: 'High Value' },
            { field: 'order_total', operator: 'less_than', value: '1000', output: 'Regular Value' }
          ],
          manufacturer_id: '1'
        }
      },
      {
        id: 'price-3',
        type: 'customNode',
        position: { x: 200, y: 550 },
        data: {
          type: 'price_adjustment',
          label: 'Free Shipping',
          configured: true,
          adjustmentType: 'fixed',
          value: 0,
          adjustment: 'shipping',
          manufacturer_id: '1'
        }
      },
      {
        id: 'invoice-2',
        type: 'customNode',
        position: { x: 200, y: 650 },
        data: {
          type: 'invoice',
          label: 'VIP Invoice (High Value)',
          configured: true,
          template: 'premium',
          manufacturer_id: '1'
        }
      },
      {
        id: 'invoice-3',
        type: 'customNode',
        position: { x: 300, y: 550 },
        data: {
          type: 'invoice',
          label: 'Standard VIP Invoice',
          configured: true,
          template: 'standard',
          manufacturer_id: '1'
        }
      },
      {
        id: 'notification-2',
        type: 'customNode',
        position: { x: 300, y: 650 },
        data: {
          type: 'notification',
          label: 'Upsell Notification',
          configured: true,
          notificationType: 'email',
          recipient: '{{customer_email}}',
          message: 'Spend over $1000 to get free shipping!',
          manufacturer_id: '1'
        }
      },
      
      // Partner Branch
      {
        id: 'conditional-3',
        type: 'customNode',
        position: { x: 450, y: 250 },
        data: {
          type: 'conditional',
          label: 'Product Type',
          configured: true,
          conditionType: 'product_type',
          conditions: [
            { field: 'product_category', operator: 'equals', value: 'bulk', output: 'Bulk Items' },
            { field: 'product_category', operator: 'equals', value: 'special', output: 'Special Items' }
          ],
          manufacturer_id: '1'
        }
      },
      {
        id: 'product-3',
        type: 'customNode',
        position: { x: 400, y: 350 },
        data: {
          type: 'product',
          label: 'Bulk Products',
          configured: true,
          productCount: 2,
          manufacturer_id: '1'
        }
      },
      {
        id: 'exception-1',
        type: 'customNode',
        position: { x: 400, y: 450 },
        data: {
          type: 'exception',
          label: 'Stock Check',
          configured: true,
          ruleCount: 1,
          manufacturer_id: '1'
        }
      },
      {
        id: 'invoice-4',
        type: 'customNode',
        position: { x: 400, y: 550 },
        data: {
          type: 'invoice',
          label: 'Partner Bulk Invoice',
          configured: true,
          template: 'wholesale',
          manufacturer_id: '1'
        }
      },
      {
        id: 'notification-3',
        type: 'customNode',
        position: { x: 500, y: 350 },
        data: {
          type: 'notification',
          label: 'Manual Review',
          configured: true,
          notificationType: 'system',
          recipient: 'partner-orders@company.com',
          message: 'Special item order requires review',
          manufacturer_id: '1'
        }
      },
      {
        id: 'product-4',
        type: 'customNode',
        position: { x: 500, y: 450 },
        data: {
          type: 'product',
          label: 'Special Products',
          configured: true,
          productCount: 1,
          manufacturer_id: '1'
        }
      },
      {
        id: 'invoice-5',
        type: 'customNode',
        position: { x: 500, y: 550 },
        data: {
          type: 'invoice',
          label: 'Partner Special Invoice',
          configured: true,
          template: 'special',
          manufacturer_id: '1'
        }
      }
    ],
    edges: [
      // Main flow
      { id: 'e1-1', source: 'email-1', target: 'conditional-1', type: 'smoothstep', animated: true },
      
      // New customer branch
      { id: 'e2-1', source: 'conditional-1', target: 'notification-1', type: 'smoothstep', animated: true },
      { id: 'e2-2', source: 'notification-1', target: 'product-1', type: 'smoothstep', animated: true },
      { id: 'e2-3', source: 'product-1', target: 'price-1', type: 'smoothstep', animated: true },
      { id: 'e2-4', source: 'price-1', target: 'invoice-1', type: 'smoothstep', animated: true },
      
      // VIP customer branch
      { id: 'e3-1', source: 'conditional-1', target: 'product-2', type: 'smoothstep', animated: true },
      { id: 'e3-2', source: 'product-2', target: 'price-2', type: 'smoothstep', animated: true },
      { id: 'e3-3', source: 'price-2', target: 'conditional-2', type: 'smoothstep', animated: true },
      { id: 'e3-4', source: 'conditional-2', target: 'price-3', type: 'smoothstep', animated: true },
      { id: 'e3-5', source: 'price-3', target: 'invoice-2', type: 'smoothstep', animated: true },
      { id: 'e3-6', source: 'conditional-2', target: 'invoice-3', type: 'smoothstep', animated: true },
      { id: 'e3-7', source: 'invoice-3', target: 'notification-2', type: 'smoothstep', animated: true },
      
      // Partner branch
      { id: 'e4-1', source: 'conditional-1', target: 'conditional-3', type: 'smoothstep', animated: true },
      { id: 'e4-2', source: 'conditional-3', target: 'product-3', type: 'smoothstep', animated: true },
      { id: 'e4-3', source: 'product-3', target: 'exception-1', type: 'smoothstep', animated: true },
      { id: 'e4-4', source: 'exception-1', target: 'invoice-4', type: 'smoothstep', animated: true },
      { id: 'e4-5', source: 'conditional-3', target: 'notification-3', type: 'smoothstep', animated: true },
      { id: 'e4-6', source: 'notification-3', target: 'product-4', type: 'smoothstep', animated: true },
      { id: 'e4-7', source: 'product-4', target: 'invoice-5', type: 'smoothstep', animated: true }
    ]
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">Advanced Order Processing Flow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <p className="text-sm">
            This complex workflow demonstrates dynamic routing of orders based on customer type,
            order value, and product categories - something that would be extremely difficult to
            implement with a form-based interface.
          </p>
          
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-md">
              <FaUserPlus className="mt-1 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium">New Customer Flow</h3>
                <p className="text-xs text-gray-600">
                  Alerts the sales team about a new customer, extracts products, adds 10% markup
                  for new customers, and generates an invoice.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-md">
              <FaCrown className="mt-1 text-purple-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium">VIP Customer Flow</h3>
                <p className="text-xs text-gray-600">
                  Extracts products, applies a 15% discount, then checks order value. Orders over $1,000
                  get free shipping and a premium invoice. Smaller orders receive an upsell notification.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 p-3 bg-green-50 rounded-md">
              <FaHandshake className="mt-1 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Partner Flow</h3>
                <p className="text-xs text-gray-600">
                  Checks product types. Bulk orders go through stock verification before invoicing.
                  Special items trigger a manual review notification before processing.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium text-sm">Why is this better than a form?</h3>
            <ul className="list-disc pl-5 text-xs space-y-1 mt-2">
              <li>Handles <strong>complex branching logic</strong> based on multiple conditions</li>
              <li>Provides <strong>visual representation</strong> of the entire process</li>
              <li>Enables <strong>different paths</strong> for different customer types</li>
              <li>Supports <strong>conditional pricing rules</strong> that change based on order details</li>
              <li>Allows for <strong>complex notification flows</strong> at different stages</li>
            </ul>
          </div>
        </div>
        
        <Button 
          className="w-full mt-5 bg-blue-600 hover:bg-blue-700"
          onClick={() => onLoad && onLoad(complexWorkflow)}
        >
          Load Demo Workflow
        </Button>
      </CardContent>
    </Card>
  );
} 