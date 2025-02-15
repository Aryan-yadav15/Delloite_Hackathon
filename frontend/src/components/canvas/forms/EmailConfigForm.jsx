'use client'

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase"
import { useManufacturer } from "@/hooks/useManufacturer"

export default function EmailConfigForm({ onSave, initialData }) {
  const supabase = useSupabase()
  const { manufacturer } = useManufacturer()
  const [emailConfig, setEmailConfig] = useState({
    email: initialData?.email || '',
    folder: initialData?.folder || 'INBOX',
    subject_pattern: initialData?.subject_pattern || '',
    manufacturer_id: manufacturer?.id
  })

  useEffect(() => {
    if (manufacturer?.id) {
      setEmailConfig(prev => ({
        ...prev,
        manufacturer_id: manufacturer.id
      }))
    }
  }, [manufacturer])

  const handleSave = async () => {
    try {
      if (!manufacturer?.id) {
        throw new Error('Manufacturer ID is required')
      }

      const configToSave = {
        ...emailConfig,
        manufacturer_id: manufacturer.id
      }

      const { data, error } = await supabase
        .from('email_configurations')
        .upsert([configToSave])
        .select()
        .single()

      if (error) throw error

      onSave({
        ...data,
        manufacturer_id: manufacturer.id,
        configured: true,
        type: 'email'
      })
    } catch (error) {
      console.error('Failed to save email configuration:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address</label>
          <Input
            placeholder="Enter email to track"
            value={emailConfig.email}
            onChange={(e) => setEmailConfig(prev => ({
              ...prev,
              email: e.target.value
            }))}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Folder to Monitor</label>
          <Input
            placeholder="Email folder (e.g., INBOX)"
            value={emailConfig.folder}
            onChange={(e) => setEmailConfig(prev => ({
              ...prev,
              folder: e.target.value
            }))}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Subject Pattern (Optional)</label>
          <Input
            placeholder="e.g., Order #*"
            value={emailConfig.subject_pattern}
            onChange={(e) => setEmailConfig(prev => ({
              ...prev,
              subject_pattern: e.target.value
            }))}
          />
          <p className="text-sm text-gray-500">
            Use * as wildcard. Leave empty to process all emails.
          </p>
        </div>
      </div>
      
      <Button 
        onClick={handleSave}
        className="w-full"
        disabled={!emailConfig.email || !manufacturer?.id}
      >
        {initialData?.configured ? 'Update Configuration' : 'Save Configuration'}
      </Button>
    </div>
  )
} 