"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PriceAdjustmentConfigForm from '../forms/PriceAdjustmentConfigForm';

export default function PriceAdjustmentConfigModal({ isOpen, onClose, onSave, initialData, isFormView = false }) {
  if (isFormView) {
    return <PriceAdjustmentConfigForm onSave={onSave} initialData={initialData} />;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Price Adjustment Configuration</DialogTitle>
        </DialogHeader>
        <PriceAdjustmentConfigForm onSave={onSave} initialData={initialData} />
      </DialogContent>
    </Dialog>
  );
} 