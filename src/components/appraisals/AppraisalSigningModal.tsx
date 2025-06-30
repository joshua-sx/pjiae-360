
"use client";

import * as React from "react";
import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, ArrowLeft, RotateCcw, Edit, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

export interface AppraisalSigningModalProps {
  appraisalId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AppraisalSigningModal({
  appraisalId = "12345",
  onClose,
  onSuccess
}: AppraisalSigningModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [pathLength, setPathLength] = useState(0);
  const [isAgreed, setIsAgreed] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Toast management
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  // Focus trap
  useEffect(() => {
    const modal = modalRef.current;
    if (modal) {
      const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
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
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        clearSignature();
      }
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [hasSignature, isSaved]);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 600;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const pos = getMousePos(e);
    setLastX(pos.x);
    setLastY(pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pos = getMousePos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    const distance = calculateDistance(lastX, lastY, pos.x, pos.y);
    const newPathLength = pathLength + distance;
    setPathLength(newPathLength);

    if (newPathLength >= 50 && !hasSignature) {
      setHasSignature(true);
    }
    setLastX(pos.x);
    setLastY(pos.y);
    setIsSaved(false);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setHasSignature(false);
    setPathLength(0);
    setSignatureDataUrl('');
    setIsSaved(false);
  };

  const saveSignature = async () => {
    if (!hasSignature) return;
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      setSignatureDataUrl(dataUrl);
      setIsSaved(true);
      showToast('Signature saved successfully');
    } catch (error) {
      showToast('Failed to save signature', 'error');
    }
  };

  const handleSignAppraisal = async () => {
    if (!hasSignature || !isAgreed || !isSaved) return;
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const response = await mockApiCall('/api/appraisals/' + appraisalId + '/signature', {
        dataUrl: signatureDataUrl,
        signedBy: 'current-user',
        signedAt: new Date().toISOString()
      });
      if (response.success) {
        showToast('Appraisal signed successfully. Thank you for completing the cycle.');
        setTimeout(() => {
          onSuccess?.();
          onClose?.();
        }, 2000);
      } else {
        throw new Error('API returned error');
      }
    } catch (error) {
      showToast('We couldn\'t save your signature – please check your connection and try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mockApiCall = async (url: string, data: any) => {
    if (Math.random() > 0.8) {
      throw new Error('Network error');
    }
    return { success: true, data };
  };

  const handleClose = () => {
    if (hasSignature && !isSaved) {
      setShowConfirmExit(true);
    } else {
      onClose?.();
    }
  };

  const confirmExit = () => {
    setShowConfirmExit(false);
    onClose?.();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
        <motion.div 
          ref={modalRef} 
          className="bg-background rounded-lg w-full max-w-2xl relative shadow-xl border"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-foreground">Sign appraisal</h2>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground text-sm">ESC</span>
              <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8" aria-label="Close modal">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-muted/30 rounded-lg border-2 border-dashed border-border p-8 mb-6 relative">
              <canvas 
                ref={canvasRef} 
                className="w-full h-48 cursor-crosshair bg-transparent touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const mouseEvent = new MouseEvent('mousedown', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                  }) as any;
                  startDrawing(mouseEvent);
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const mouseEvent = new MouseEvent('mousemove', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                  }) as any;
                  draw(mouseEvent);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  stopDrawing();
                }}
                aria-label="Signature pad – draw using mouse or touch"
              />
              {!hasSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-muted-foreground text-sm">Draw your signature here</p>
                </div>
              )}
              {pathLength > 0 && pathLength < 50 && (
                <div className="absolute bottom-2 left-2">
                  <p className="text-orange-600 text-xs">
                    Signature too short ({Math.round(pathLength)}/50px)
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={clearSignature} className="flex items-center gap-2" title="Ctrl+Z">
                  <RotateCcw className="h-4 w-4" />
                  <span>Clear signature</span>
                </Button>
              </div>
              <Button onClick={saveSignature} disabled={!hasSignature || isSaved} className="flex items-center gap-2">
                {isSaved && <Check className="h-4 w-4" />}
                <span>Save signature</span>
              </Button>
            </div>

            <p className="text-muted-foreground text-sm mb-6">
              This appraisal will be signed by and sent to HR for processing
            </p>

            <div className="flex items-start gap-3 mb-8">
              <Checkbox 
                id="agreement" 
                checked={isAgreed} 
                onCheckedChange={(checked) => setIsAgreed(checked as boolean)} 
                className="mt-1" 
              />
              <label htmlFor="agreement" className="text-foreground text-sm leading-relaxed cursor-pointer">
                I confirm that I have read and agree to the appraisal result and company policy PJIAE/HR/MC/17-01.
              </label>
            </div>

            <div className="flex items-center justify-end">
              <Button 
                onClick={handleSignAppraisal} 
                disabled={!hasSignature || !isAgreed || !isSaved || isSubmitting} 
                className="font-medium flex items-center gap-2"
              >
                {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>Sign & Submit</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showConfirmExit && (
          <motion.div 
            className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-background rounded-lg p-6 max-w-md shadow-xl border"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <h3 className="text-foreground text-lg font-semibold mb-4">Discard unsaved signature?</h3>
              <p className="text-muted-foreground text-sm mb-6">
                You have an unsaved signature. Are you sure you want to discard it?
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowConfirmExit(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmExit}>
                  Discard
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div 
            className="fixed top-4 right-4 z-70"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <Alert className={cn(
              "shadow-lg flex items-center gap-3",
              toast.type === 'error' 
                ? "border-destructive bg-destructive/10 text-destructive" 
                : "border-green-500 bg-green-50 text-green-800"
            )}>
              {toast.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              <AlertDescription>{toast.message}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
