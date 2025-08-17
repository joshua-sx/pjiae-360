
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepProgressIndicatorProps {
  totalSteps?: number;
  currentStep?: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

function StepProgressIndicator({
  totalSteps = 9,
  currentStep: controlledCurrentStep,
  onStepClick,
  className
}: StepProgressIndicatorProps): JSX.Element {
  const [internalCurrentStep, setInternalCurrentStep] = useState(1);
  const currentStep = controlledCurrentStep ?? internalCurrentStep;

  const handleStepClick = (step: number) => {
    if (onStepClick) {
      onStepClick(step);
    } else {
      setInternalCurrentStep(step);
    }
  };

  const getStepState = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto px-4", className)}>
      {/* Mobile: Simple current step indicator */}
      <div className="block sm:hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <span className="text-xs font-medium">{currentStep}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
          </div>
        </div>
        
        {/* Mobile progress bar */}
        <div className="w-full bg-muted rounded-full h-1.5">
          <motion.div
            className="bg-primary h-1.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Desktop: Clean step indicators with thin connecting line */}
      <div className="hidden sm:block">
        <div className="relative">
          <div className="flex justify-between items-center">
            {/* Background connecting line */}
            {totalSteps > 1 && (
              <div 
                className="absolute top-4 left-0 right-0 h-px bg-border"
                style={{
                  left: `${50 / totalSteps}%`,
                  right: `${50 / totalSteps}%`
                }}
              />
            )}
            
            {/* Progress connecting line */}
            {totalSteps > 1 && (
              <motion.div
                className="absolute top-4 h-px bg-primary"
                style={{
                  left: `${50 / totalSteps}%`
                }}
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentStep - 1) / (totalSteps - 1)) * (100 - (100 / totalSteps))}%`
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            )}

            {Array.from({ length: totalSteps }, (_, index) => {
              const stepNumber = index + 1;
              const state = getStepState(stepNumber);

              return (
                <motion.button
                  key={stepNumber}
                  onClick={() => handleStepClick(stepNumber)}
                  className={cn(
                    "relative w-8 h-8 rounded-full flex items-center justify-center",
                    "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
                    {
                      'bg-primary text-primary-foreground': state === 'completed' || state === 'current',
                      'bg-muted border border-border text-muted-foreground': state === 'upcoming'
                    }
                  )}
                  aria-label={`Step ${stepNumber}${
                    state === 'completed' ? ' completed' : 
                    state === 'current' ? ' current' : ''
                  }`}
                  aria-current={state === 'current' ? 'step' : undefined}
                >
                  {state === 'completed' ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <span className="text-xs font-medium">{stepNumber}</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StepProgressIndicator;
