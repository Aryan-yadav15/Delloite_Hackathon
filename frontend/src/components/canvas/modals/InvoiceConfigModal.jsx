'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useSupabase } from "@/lib/supabase"

export default function InvoiceConfigModal({ isOpen, onClose, onSave, initialData }) {
  const supabase = useSupabase()
  const [invoiceConfig, setInvoiceConfig] = useState({
    header_text: initialData?.header_text || '',
    footer_text: initialData?.footer_text || '',
    company_details: initialData?.company_details || '',
    logo_url: initialData?.logo_url || '',
    additional_notes: initialData?.additional_notes || '',
    manufacturer_id: initialData?.manufacturer_id
  })

  const handleSave = async () => {
    try {
      const { data, error } = await supabase
        .from('invoice_templates')
        .upsert([{
          ...invoiceConfig,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      onSave({
        ...data,
        configured: true
      })
      onClose()
    } catch (error) {
      console.error('Failed to save invoice template:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Invoice Template Configuration</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Logo URL</label>
            <Input
              placeholder="https://your-logo-url.com/logo.png"
              value={invoiceConfig.logo_url}
              onChange={(e) => setInvoiceConfig(prev => ({
                ...prev,
                logo_url: e.target.value
              }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Header Text</label>
            <Input
              placeholder="Invoice header text"
              value={invoiceConfig.header_text}
              onChange={(e) => setInvoiceConfig(prev => ({
                ...prev,
                header_text: e.target.value
              }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Company Details</label>
            <Textarea
              placeholder="Full company details (address, contact, etc.)"
              value={invoiceConfig.company_details}
              onChange={(e) => setInvoiceConfig(prev => ({
                ...prev,
                company_details: e.target.value
              }))}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Footer Text</label>
            <Input
              placeholder="Invoice footer text"
              value={invoiceConfig.footer_text}
              onChange={(e) => setInvoiceConfig(prev => ({
                ...prev,
                footer_text: e.target.value
              }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Notes</label>
            <Textarea
              placeholder="Terms, conditions, or other notes"
              value={invoiceConfig.additional_notes}
              onChange={(e) => setInvoiceConfig(prev => ({
                ...prev,
                additional_notes: e.target.value
              }))}
              rows={3}
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 