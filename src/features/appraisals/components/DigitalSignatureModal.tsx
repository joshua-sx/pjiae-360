
"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, ArrowLeft, RotateCcw, Check, AlertCircle, Undo2, Redo2, Signature, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import _ from 'lodash';

// Constants
const CANVAS_CONFIG = {
  WIDTH: 600,
  HEIGHT: 200,
  STROKE_STYLE: 'hsl(var(--foreground))',
  LINE_WIDTH: 3,
  LINE_CAP: 'round' as CanvasLineCap,
  LINE_JOIN: 'round' as CanvasLineJoin
};

export interface DigitalSignatureModalProps {
  appraisalId?: string;
  onClose: () => void;
  onSuccess: (signatureDataUrl: string) => void;
  open: boolean;
}

export default function DigitalSignatureModal({
  appraisalId = "12345",
  onClose,
  onSuccess,
  open
}: DigitalSignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [pathLength, setPathLength] = useState(0);
  const [isAgreed, setIsAgreed] = useState(false);
  const [lastPosition, setLastPosition] = useState({
    x: 0,
    y: 0
  });
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [history, setHistory] = useState<{
    dataUrl: string;
    pathLength: number;
  }[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({
      message,
      type
    });
    setTimeout(() => setToast(null), 5000);
  };

  const steps = [{
    id: 'create',
    label: 'Create signature',
    completed: hasSignature
  }, {
    id: 'save',
    label: 'Save signature',
    completed: isSaved
  }, {
    id: 'agree',
    label: 'Accept terms',
    completed: isAgreed
  }];

  const currentStep = steps.findIndex(step => !step.completed);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push({
      dataUrl: canvas.toDataURL(),
      pathLength: pathLength
    });
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  }, [history, historyStep, pathLength]);

  const restoreFromHistory = useCallback((step: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      setPathLength(history[step].pathLength);
      setHasSignature(history[step].pathLength > 0);
      setHistoryStep(step);
      setIsSaved(false);
    };
    img.src = history[step].dataUrl;
  }, [history]);

  const undo = useCallback(() => {
    if (historyStep > 0) {
      restoreFromHistory(historyStep - 1);
    }
  }, [historyStep, restoreFromHistory]);

  const redo = useCallback(() => {
    if (historyStep < history.length - 1) {
      restoreFromHistory(historyStep + 1);
    }
  }, [historyStep, history.length, restoreFromHistory]);

  useEffect(() => {
    const modal = modalRef.current;
    if (modal && open) {
      const focusableElements = modal.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };
      modal.addEventListener('keydown', handleTabKey);
      firstElement?.focus();
      return () => modal.removeEventListener('keydown', handleTabKey);
    }
  }, [open]);

  const handleClose = useCallback(() => {
    if (hasSignature && !isSaved) {
      setShowConfirmExit(true);
    } else {
      // Reset states when closing
      setIsSubmitting(false);
      setIsAgreed(false);
      setIsSaved(false);
      setHasSignature(false);
      setPathLength(0);
      setSignatureDataUrl('');
      onClose?.();
    }
  }, [hasSignature, isSaved, onClose]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [undo, redo, handleClose]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = CANVAS_CONFIG.WIDTH;
      canvas.height = CANVAS_CONFIG.HEIGHT;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = CANVAS_CONFIG.STROKE_STYLE;
        ctx.lineWidth = CANVAS_CONFIG.LINE_WIDTH;
        ctx.lineCap = CANVAS_CONFIG.LINE_CAP;
        ctx.lineJoin = CANVAS_CONFIG.LINE_JOIN;
        if (history.length === 0) {
          setHistory([{
            dataUrl: canvas.toDataURL(),
            pathLength: 0
          }]);
          setHistoryStep(0);
        }
      }
    }
  }, [history.length]);

  const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  const getMousePos = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return {
      x: 0,
      y: 0
    };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const pos = getMousePos(e.nativeEvent);
    setLastPosition(pos);
  }, []);

  const debouncedDraw = useCallback(_.throttle((e: MouseEvent | TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const pos = getMousePos(e);
    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    const distance = calculateDistance(lastPosition.x, lastPosition.y, pos.x, pos.y);
    const newPathLength = pathLength + distance;
    setPathLength(newPathLength);
    setLastPosition(pos);
    setIsSaved(false);
  }, 16), [isDrawing, lastPosition, pathLength]);

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
      if (pathLength > 0) {
        setHasSignature(true);
      }
    }
  }, [isDrawing, saveToHistory, pathLength]);

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setPathLength(0);
    setSignatureDataUrl('');
    setIsSaved(false);
    setLastPosition({
      x: 0,
      y: 0
    });
    const blankHistory = [{
      dataUrl: canvas.toDataURL(),
      pathLength: 0
    }];
    setHistory(blankHistory);
    setHistoryStep(0);
  }, []);

  const saveSignature = useCallback(async () => {
    try {
      if (!hasSignature) {
        showToast('Please draw a valid signature first.', 'error');
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas) {
        showToast('Canvas not available.', 'error');
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      setSignatureDataUrl(dataUrl);
      setIsSaved(true);
      showToast('Signature saved successfully');
    } catch (error) {
      showToast('Failed to save signature', 'error');
    }
  }, [hasSignature]);

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
      showToast('Please complete all steps before signing.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      // Ensure we have the current signature data from canvas
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('Canvas not available');
      }
      const currentSignatureDataUrl = canvas.toDataURL('image/png');

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));

      // Call success and close modal
      onSuccess?.(currentSignatureDataUrl);
      onClose?.();
    } catch (error) {
      showToast(`Failed to sign appraisal`, 'error');
      setIsSubmitting(false);
    }
    // Don't set isSubmitting to false here as the modal will close
  }, [canSubmit, onSuccess, onClose]);

  const confirmExit = () => {
    setShowConfirmExit(false);
    // Reset all states before closing
    setIsSubmitting(false);
    setIsAgreed(false);
    setIsSaved(false);
    setHasSignature(false);
    setPathLength(0);
    setSignatureDataUrl('');
    onClose?.();
  };

  const ProgressIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center gap-2">
            <div className={cn(
              `w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all`,
              step.completed
                ? 'bg-primary text-primary-foreground'
                : index === currentStep
                ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                : 'bg-muted text-muted-foreground'
            )}>
              {step.completed ? <Check size={16} /> : index + 1}
            </div>
            <span className={cn(
              `text-sm hidden sm:inline`,
              step.completed
                ? 'text-primary'
                : index === currentStep
                ? 'text-primary font-medium'
                : 'text-muted-foreground'
            )}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={cn(
              `flex-1 h-0.5 transition-all`,
              step.completed ? 'bg-primary' : 'bg-muted'
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const SignatureStatus = () => {
    if (isSaved) {
      return (
        <div className="flex items-center gap-2 text-primary text-sm">
          <Check size={16} />
          <span>Signature saved and ready</span>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    // Reset all states when modal is closed
    if (!open) {
      setIsSubmitting(false);
      setIsAgreed(false);
      setIsSaved(false);
      setHasSignature(false);
      setPathLength(0);
      setSignatureDataUrl('');
      setLastPosition({
        x: 0,
        y: 0
      });
      setHistory([]);
      setHistoryStep(-1);
      setToast(null);
      setShowConfirmExit(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-labelledby="sign-appraisal-title"
          aria-modal="true"
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card rounded-lg w-full max-w-2xl relative border"
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
              <ProgressIndicator />
            </div>

            <div className="p-6 pt-0">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-card-foreground mb-2">Electronic Signature</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Please sign in the box below. When you're ready, click <span className="font-semibold">Save Signature</span> and <span className="font-semibold">Agree</span> to company policies to submit your form.
                </p>
              </div>

              <div className={cn(
                `bg-muted/50 rounded-lg border-2 border-dashed border-border p-4 sm:p-8 mb-4 relative transition-all`,
                isHovering && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
              )}>
                <canvas
                  ref={canvasRef}
                  className="w-full h-48 cursor-crosshair bg-transparent touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={(e) => debouncedDraw(e.nativeEvent)}
                  onMouseUp={stopDrawing}
                  onMouseLeave={() => {
                    setIsHovering(false);
                    stopDrawing();
                  }}
                  onMouseEnter={() => setIsHovering(true)}
                  onTouchStart={startDrawing}
                  onTouchMove={(e) => debouncedDraw(e.nativeEvent)}
                  onTouchEnd={stopDrawing}
                  aria-label="Signature pad – draw using mouse or touch"
                />
                {!hasSignature && pathLength === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-muted-foreground text-sm">
                      {typeof window !== 'undefined' && 'ontouchstart' in window ? 'Use your finger to sign here' : 'Sign here'}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <SignatureStatus />
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={undo} disabled={historyStep <= 0} aria-label="Undo last stroke">
                    <Undo2 size={20} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={redo} disabled={historyStep >= history.length - 1} aria-label="Redo last stroke">
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
                  <Button onClick={saveSignature} disabled={!hasSignature}>
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
                  onCheckedChange={(checked) => setIsAgreed(!!checked)}
                  className="mt-1"
                />
                <label htmlFor="agreement" className="text-sm leading-relaxed cursor-pointer text-card-foreground">
                  I confirm that I have read and agree to the appraisal result and company policy PJIAE/HR/MC/17-01.
                </label>
              </div>

              <DialogFooter className="flex items-center justify-end">
                <Button variant="ghost" onClick={handleClose}>Cancel</Button>
                <Button
                  onClick={handleSignAppraisal}
                  disabled={!canSubmit() || isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {getSubmitButtonText()}
                </Button>
              </DialogFooter>
            </div>
          </motion.div>
        </motion.div>
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
            <Button variant="outline" onClick={() => setShowConfirmExit(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmExit}>Discard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="fixed top-4 right-4 z-[100]"
            role="alert"
            aria-live="polite"
          >
            <Alert variant={toast.type === 'error' ? 'destructive' : 'default'} className="shadow-lg">
              {toast.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              <AlertTitle>{toast.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
              <AlertDescription>{toast.message}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
