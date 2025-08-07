"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, ArrowLeft, RotateCcw, Check, AlertCircle, Undo2, Redo2, Signature, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useSignatureCanvas } from '@/hooks/useSignatureCanvas';
import { useAppraisalCRUD } from '@/hooks/useAppraisalCRUD';
import { useToast } from '@/hooks/use-toast';
import { SignatureSteps } from './SignatureSteps';

export interface AppraisalSigningModalProps {
  appraisalId?: string;
  onClose: () => void;
  onSuccess: (signatureDataUrl: string) => void;
  open: boolean;
}

export default function AppraisalSigningModal({
  appraisalId = "12345",
  onClose,
  onSuccess,
  open,
}: AppraisalSigningModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const {
    canvasRef,
    hasSignature,
    pathLength,
    isSaved,
    signatureDataUrl,
    startDrawing,
    draw,
    stopDrawing,
    clearSignature,
    undo,
    redo,
    saveSignature,
    historyStep,
    historyLength,
  } = useSignatureCanvas();
  
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { saveSignature: saveAppraisalSignature } = useAppraisalCRUD();
  const { toast } = useToast();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    toast({
      title: type === 'success' ? 'Success' : 'Error',
      description: message,
      variant: type === 'error' ? 'destructive' : 'default'
    });
  };

  const signatureSteps = [
    { 
      id: 1, 
      title: "Create signature", 
      description: "Draw your signature in the canvas below",
      completed: hasSignature 
    },
    { 
      id: 2, 
      title: "Save signature", 
      description: "Click save to confirm your signature",
      completed: isSaved 
    },
    { 
      id: 3, 
      title: "Accept terms", 
      description: "Agree to company policies and terms",
      completed: isAgreed 
    },
  ];

  useEffect(() => {
    const modal = modalRef.current;
    if (modal && open) {
      const focusableElements = modal.querySelectorAll<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      };
      modal.addEventListener("keydown", handleTabKey);
      firstElement?.focus();
      return () => modal.removeEventListener("keydown", handleTabKey);
    }
  }, [open]);

  const handleClose = useCallback(() => {
    if (hasSignature && !isSaved) {
      setShowConfirmExit(true);
    } else {
      setIsSubmitting(false);
      setIsAgreed(false);
      clearSignature();
      onClose?.();
    }
  }, [hasSignature, isSaved, clearSignature, onClose]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if (e.key === "Escape") {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [undo, redo, handleClose]);

  const handleSaveSignature = useCallback(() => {
    const dataUrl = saveSignature();
    if (dataUrl) {
      showToast("Signature saved successfully");
    } else {
      showToast("Please draw a valid signature first.", "error");
    }
  }, [saveSignature]);

  const getSubmitButtonText = () => {
    if (!hasSignature) return "Draw signature first";
    if (!isSaved) return "Save signature first";
    if (!isAgreed) return "Accept agreement first";
    if (isSubmitting) return "Signing...";
    return "Sign appraisal";
  };

  const canSubmit = () => {
    return hasSignature && isAgreed && isSaved;
  };

  const handleSignAppraisal = useCallback(async () => {
    if (!canSubmit()) {
      showToast("Please complete all steps before signing.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const currentSignatureDataUrl = signatureDataUrl;
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save signature to database
      if (currentSignatureDataUrl) {
        await saveAppraisalSignature(appraisalId, 'employee', currentSignatureDataUrl);
      }

      onSuccess?.(currentSignatureDataUrl);
      onClose?.();
    } catch (error) {
      showToast("Failed to sign appraisal", "error");
      setIsSubmitting(false);
    }
  }, [canSubmit, onSuccess, onClose, appraisalId, saveAppraisalSignature, signatureDataUrl]);

  const confirmExit = () => {
    setShowConfirmExit(false);
    setIsSubmitting(false);
    setIsAgreed(false);
    clearSignature();
    onClose?.();
  };

  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
      setIsAgreed(false);
      clearSignature();
      setShowConfirmExit(false);
    }
  }, [open, clearSignature]);

  if (!open) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-lg w-full max-w-2xl relative shadow-lg border"
            >
              <DialogHeader className="flex items-center justify-between p-6 border-b">
                <DialogTitle id="sign-appraisal-title" className="text-xl font-medium text-card-foreground">
                  Sign appraisal
                </DialogTitle>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground text-sm hidden sm:inline">ESC</span>
                  <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close modal">
                    <X size={20} />
                  </Button>
                </div>
              </DialogHeader>

              <div className="px-6 pt-6">
                <SignatureSteps currentStep={1} steps={signatureSteps} />
              </div>

              <div className="p-6 pt-0">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-card-foreground mb-2">Electronic Signature</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Please sign in the box below. When you're ready, click <span className="font-semibold">Save Signature</span> and <span className="font-semibold">Agree</span> to company policies to submit your form.
                  </p>
                </div>

                <div
                  className={cn(
                    `bg-muted/50 rounded-lg border-2 border-dashed border-border p-4 sm:p-8 mb-4 relative transition-all`,
                    isHovering && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                >
                  <canvas
                    ref={canvasRef}
                    className="w-full h-48 cursor-crosshair bg-transparent touch-none"
                    onMouseDown={e => startDrawing(e.nativeEvent)}
                    onMouseMove={e => draw(e.nativeEvent)}
                    onMouseUp={stopDrawing}
                    onMouseLeave={() => {
                      setIsHovering(false);
                      stopDrawing();
                    }}
                    onMouseEnter={() => setIsHovering(true)}
                    onTouchStart={e => startDrawing(e.nativeEvent)}
                    onTouchMove={e => draw(e.nativeEvent)}
                    onTouchEnd={stopDrawing}
                    aria-label="Signature pad – draw using mouse or touch"
                  />
                  {!hasSignature && pathLength === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <p className="text-muted-foreground text-sm">
                        {typeof window !== "undefined" && "ontouchstart" in window
                          ? "Use your finger to sign here"
                          : "Sign here"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-6">
                  {isSaved && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <Check size={16} />
                      <span>Signature saved and ready</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={undo}
                      disabled={historyStep <= 0}
                      aria-label="Undo last stroke"
                    >
                      <Undo2 size={20} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={redo}
                      disabled={historyStep >= historyLength - 1}
                      aria-label="Redo last stroke"
                    >
                      <Redo2 size={20} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={clearSignature} aria-label="Clear signature">
                      <RotateCcw size={20} />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <Button variant="link" onClick={handleClose} className="p-0 h-auto">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to appraisal
                  </Button>
                  {!isSaved && (
                    <Button onClick={handleSaveSignature} disabled={!hasSignature}>
                      Save signature
                    </Button>
                  )}
                </div>

                <p className="text-muted-foreground text-sm mb-6">
                  This appraisal will be signed by you and sent to HR for processing.
                </p>

                <div className="flex items-start gap-3 mb-8">
                  <Checkbox
                    id="agreement"
                    checked={isAgreed}
                    onCheckedChange={checked => setIsAgreed(!!checked)}
                    className="mt-1"
                  />
                  <label
                    htmlFor="agreement"
                    className="text-sm leading-relaxed cursor-pointer text-card-foreground"
                  >
                    I confirm that I have read and agree to the appraisal result and company policy PJIAE/HR/MC/17-01.
                  </label>
                </div>

                <DialogFooter className="flex items-center justify-end">
                  <Button variant="ghost" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleSignAppraisal} disabled={!canSubmit() || isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {getSubmitButtonText()}
                  </Button>
                </DialogFooter>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showConfirmExit} onOpenChange={setShowConfirmExit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard unsaved signature?</DialogTitle>
            <DialogDescription>
              You have an unsaved signature. Are you sure you want to discard it?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmExit(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmExit}>
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
