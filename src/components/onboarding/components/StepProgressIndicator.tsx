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

const StepProgressIndicator: React.FC<StepProgressIndicatorProps> = ({
  totalSteps = 9,
  currentStep: controlledCurrentStep,
  onStepClick,
  className
}) => {
  const [internalCurrentStep, setInternalCurrentStep] = useState(1);
  const currentStep = controlledCurrentStep ?? internalCurrentStep;
  const progressPercentage = (currentStep - 1) / (totalSteps - 1) * 100;

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
    <div className={cn("w-full max-w-4xl mx-auto px-4 py-2 sm:p-4", className)}>
      {/* Mobile: Show current step indicator */}
      <div className="block sm:hidden">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              className={cn(
                "w-10 h-10 rounded-full border-2 flex items-center justify-center",
                "bg-primary border-primary text-primary-foreground"
              )}
            >
              {getStepState(currentStep) === 'completed' ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="text-sm font-semibold">{currentStep}</span>
              )}
            </motion.div>
            <div className="text-sm font-medium text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </div>
          </div>
        </div>
        
        {/* Mobile progress bar */}
        <div className="w-full bg-border rounded-full h-2 mb-4">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </div>

      {/* Desktop: Full step indicators */}
      <div className="hidden sm:block">
        <div className="relative">
          {/* Steps Grid - Responsive */}
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2 sm:gap-4">
            {/* Connection Line - positioned to span between step centers */}
            {totalSteps > 1 && (
              <>
                <div 
                  className="absolute top-6 h-0.5 bg-border -z-10"
                  style={{
                    left: `calc(${100 / (totalSteps * 2)}%)`,
                    width: `calc(${100 - (100 / totalSteps)}%)`
                  }}
                />
                <motion.div
                  className="absolute top-6 h-0.5 bg-primary -z-10"
                  style={{
                    left: `calc(${100 / (totalSteps * 2)}%)`
                  }}
                  initial={{ width: 0 }}
                  animate={{
                    width: totalSteps > 1 ? `calc(${((currentStep - 1) / (totalSteps - 1)) * (100 - (100 / totalSteps))}%)` : '0%'
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                />
              </>
            )}
            {Array.from({ length: totalSteps }, (_, index) => {
              const stepNumber = index + 1;
              const state = getStepState(stepNumber);

              return (
                <div key={stepNumber} className="flex flex-col items-center">
                  <motion.button
                    onClick={() => handleStepClick(stepNumber)}
                    className={cn(
                      "relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center",
                      "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      "hover:scale-105 active:scale-95 touch-manipulation",
                      {
                        'bg-primary border-primary text-primary-foreground': state === 'completed',
                        'bg-primary border-primary text-primary-foreground ring-4 ring-primary/20': state === 'current',
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
                        transition={{
                          duration: 0.3,
                          delay: 0.1
                        }}
                      >
                        <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                      </motion.div>
                    ) : (
                      <motion.span
                        className="text-xs sm:text-sm font-semibold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {stepNumber}
                      </motion.span>
                    )}
                    
                    {state === 'current' && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary"
                        initial={{ scale: 1, opacity: 0 }}
                        animate={{
                          scale: 1.3,
                          opacity: 0
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                      />
                    )}
                  </motion.button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepProgressIndicator;