
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader, Check, AlertCircle } from "lucide-react";

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SaveStatusIndicatorProps {
  currentStep: number;
  saveStatus: SaveStatus;
  lastSaved: Date | null;
}

export default function SaveStatusIndicator({ currentStep, saveStatus, lastSaved }: SaveStatusIndicatorProps) {
  if (currentStep === 0) return null;
  
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <AnimatePresence mode="wait">
        {saveStatus === 'saving' && (
          <motion.div
            key="saving"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1"
          >
            <Loader className="h-3 w-3 animate-spin" />
            <span>Saving...</span>
          </motion.div>
        )}
        
        {saveStatus === 'saved' && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1 text-green-600"
          >
            <Check className="h-3 w-3" />
            <span>Saved</span>
          </motion.div>
        )}
        
        {saveStatus === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1 text-red-600"
          >
            <AlertCircle className="h-3 w-3" />
            <span>Save failed</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {lastSaved && saveStatus === 'idle' && (
        <span className="text-xs">
          Last saved {lastSaved.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
