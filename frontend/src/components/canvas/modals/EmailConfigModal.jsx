'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase"
import { useManufacturer } from "@/hooks/useManufacturer"

export default function EmailConfigModal({ isOpen, onClose, onSave, initialData, isFormView }) {
  const supabase = useSupabase()
  const { manufacturer } = useManufacturer()
  const [emailConfig, setEmailConfig] = useState({
    email: initialData?.email || '',
    folder: initialData?.folder || 'INBOX',
    subject_pattern: initialData?.subject_pattern || '',
    manufacturer_id: manufacturer?.id // Set manufacturer ID from context
  })

  // Update emailConfig when manufacturer changes
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

      // Ensure manufacturer_id is set in the data
      const configToSave = {
        ...emailConfig,
        manufacturer_id: manufacturer.id
      }

      console.log('Saving email config:', configToSave)

      // Save email configuration to database
      const { data, error } = await supabase
        .from('email_configurations')
        .upsert([configToSave])
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Saved email config:', data)

      // Pass back the saved data with additional fields
      onSave({
        ...data,
        manufacturer_id: manufacturer.id,
        configured: true,
        type: 'email'
      })
    } catch (error) {
      console.error('Failed to save email configuration:', error)
      // You might want to show an error toast here
    }
  }

  const handleSubmit = async () => {
    await handleSave();
    if (!isFormView) {
      onClose();
    }
  };

  return (
    <>
      {isFormView ? (
        // Inline form version
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Email Configuration</h3>
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
          </div>
          
          <Button 
            onClick={handleSubmit}
            className="w-full"
            disabled={!emailConfig.email || !manufacturer?.id}
          >
            {initialData?.configured ? 'Update Configuration' : 'Save Configuration'}
          </Button>
        </div>
      ) : (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Email Configuration</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
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
              <Button 
                onClick={handleSubmit} 
                className="w-full"
                disabled={!emailConfig.email || !manufacturer?.id}
              >
                Save Configuration
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
} 