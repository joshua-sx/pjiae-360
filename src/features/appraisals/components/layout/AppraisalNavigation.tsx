import React from 'react';
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Save, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveStatus } from '../SaveStatusIndicator';

interface AppraisalNavigationProps {
  currentStep: number;
  canProceed: boolean;
  isLoading: boolean;
  saveStatus: SaveStatus;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSaveDraft: () => void;
}

export function AppraisalNavigation({
  currentStep,
  canProceed,
  isLoading,
  saveStatus,
  onPrevStep,
  onNextStep,
  onSaveDraft
}: AppraisalNavigationProps) {
  if (currentStep === 0) return null;

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center pt-6 border-t border-border/50"
      >
      <Button 
        variant="outline" 
        onClick={onPrevStep} 
        disabled={currentStep === 0} 
        size="lg" 
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Previous
      </Button>

      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          onClick={onSaveDraft} 
          disabled={isLoading || saveStatus === 'saving'} 
          size="lg" 
          className="flex items-center gap-2"
        >
          {saveStatus === 'saving' ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isLoading || saveStatus === 'saving' ? 'Saving...' : 'Save Draft'}
        </Button>

        {currentStep < 4 && (
          <Button 
            onClick={onNextStep}
            disabled={!canProceed}
            size="lg"
            className="flex items-center gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      </motion.div>
    </div>
  );
}