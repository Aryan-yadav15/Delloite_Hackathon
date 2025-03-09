"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NotificationConfigModal({ isOpen, onClose, onSave, initialData, isFormView = false }) {
  const [notification, setNotification] = useState({
    notificationType: initialData?.notificationType || "email",
    recipientType: initialData?.recipientType || "internal",
    recipient: initialData?.recipient || "",
    subject: initialData?.subject || "",
    message: initialData?.message || "",
    condition: initialData?.condition || "always"
  });

  const handleSave = () => {
    onSave({
      ...notification,
      configured: true
    });
    if (!isFormView) onClose();
  };

  const notificationForm = (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Configure Notification</h2>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Notification Type</label>
          <Select
            value={notification.notificationType}
            onValueChange={(value) => setNotification({...notification, notificationType: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select notification type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="system">System Alert</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Recipient Type</label>
          <Select
            value={notification.recipientType}
            onValueChange={(value) => setNotification({...notification, recipientType: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select recipient type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="internal">Staff</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {notification.recipientType === "custom" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Recipient</label>
            <Input
              value={notification.recipient}
              onChange={(e) => setNotification({...notification, recipient: e.target.value})}
              placeholder="Email address or phone number"
            />
          </div>
        )}
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Subject</label>
          <Input
            value={notification.subject}
            onChange={(e) => setNotification({...notification, subject: e.target.value})}
            placeholder="Notification subject"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Message</label>
          <Textarea
            value={notification.message}
            onChange={(e) => setNotification({...notification, message: e.target.value})}
            placeholder="Notification message"
            rows={4}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">When to Send</label>
          <Select
            value={notification.condition}
            onValueChange={(value) => setNotification({...notification, condition: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select when to send" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="always">Always</SelectItem>
              <SelectItem value="on_error">On Error</SelectItem>
              <SelectItem value="high_value">High Value Orders</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button 
        onClick={handleSave}
        className="w-full"
        disabled={!notification.subject || !notification.message || 
          (notification.recipientType === "custom" && !notification.recipient)}
      >
        {initialData?.configured ? 'Update Notification' : 'Save Notification'}
      </Button>
    </div>
  );

  if (isFormView) {
    return notificationForm;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Notification Configuration</DialogTitle>
        </DialogHeader>
        {notificationForm}
      </DialogContent>
    </Dialog>
  );
} 