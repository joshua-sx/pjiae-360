
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAppraisalCRUD } from '@/hooks/useAppraisalCRUD';

interface DigitalSignatureModalProps {
  open: boolean;
  appraisalId: string;
  onClose: () => void;
  onSuccess: (signatureDataUrl: string) => void;
}

export default function DigitalSignatureModal({
  open,
  appraisalId,
  onClose,
  onSuccess
}: DigitalSignatureModalProps) {
  const [signatureData, setSignatureData] = useState('');
  const { saveSignature, loading } = useAppraisalCRUD();

  const handleSave = async () => {
    try {
      await saveSignature(appraisalId, 'employee', signatureData);
      onSuccess(signatureData);
    } catch (error) {
      console.error('Failed to save signature:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Digital Signature</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">Signature canvas placeholder</p>
            <input
              type="text"
              placeholder="Enter signature text"
              value={signatureData}
              onChange={(e) => setSignatureData(e.target.value)}
              className="mt-4 px-3 py-2 border rounded-md"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading || !signatureData}>
              Save Signature
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
