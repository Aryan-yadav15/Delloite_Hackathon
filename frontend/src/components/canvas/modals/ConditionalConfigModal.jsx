"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ConditionalConfigForm from '../forms/ConditionalConfigForm';

export default function ConditionalConfigModal({ isOpen, onClose, onSave, initialData, isFormView = false }) {
  if (isFormView) {
    return <ConditionalConfigForm onSave={onSave} initialData={initialData} />;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Conditional Logic Configuration</DialogTitle>
        </DialogHeader>
        <ConditionalConfigForm onSave={onSave} initialData={initialData} />
      </DialogContent>
    </Dialog>
  );
} 