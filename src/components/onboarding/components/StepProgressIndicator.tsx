
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
    <div className={cn("w-full max-w-4xl mx-auto px-4 py-6", className)}>
      {/* Mobile: Simple current step indicator */}
      <div className="block sm:hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary border-2 border-primary text-primary-foreground flex items-center justify-center">
              <span className="text-sm font-semibold">{currentStep}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
          </div>
        </div>
        
        {/* Mobile progress bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Desktop: Full step indicators with connecting line */}
      <div className="hidden sm:block">
        <div className="relative">
          {/* Steps */}
          <div className="flex justify-between items-center">
            {/* Background connecting line */}
            {totalSteps > 1 && (
              <div 
                className="absolute top-6 left-0 right-0 h-0.5 bg-border -z-10"
                style={{
                  left: `${50 / totalSteps}%`,
                  right: `${50 / totalSteps}%`
                }}
              />
            )}
            
            {/* Progress connecting line */}
            {totalSteps > 1 && (
              <motion.div
                className="absolute top-6 h-0.5 bg-primary -z-10"
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
                    "relative w-12 h-12 rounded-full border-2 flex items-center justify-center",
                    "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "hover:scale-105 active:scale-95",
                    {
                      'bg-primary border-primary text-primary-foreground shadow-md': state === 'completed',
                      'bg-primary border-primary text-primary-foreground shadow-lg ring-4 ring-primary/20': state === 'current',
                      'bg-background border-border text-muted-foreground hover:border-primary/50': state === 'upcoming'
                    }
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Step ${stepNumber}${
                    state === 'completed' ? ' completed' : 
                    state === 'current' ? ' current' : ''
                  }`}
                >
                  {state === 'completed' ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                  
                  {/* Pulse animation for current step */}
                  {state === 'current' && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary"
                      initial={{ scale: 1, opacity: 0 }}
                      animate={{
                        scale: 1.4,
                        opacity: 0
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut"
                      }}
                    />
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
