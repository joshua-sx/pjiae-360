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
    <div className={cn("w-full max-w-4xl mx-auto p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-medium text-foreground">
          Step {currentStep} of {totalSteps}
        </h2>
        <span className="text-sm text-muted-foreground font-medium">
          {Math.round(progressPercentage)}% complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-12">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{
              duration: 0.6,
              ease: [0.4, 0, 0.2, 1]
            }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-border -z-10" />
        <motion.div
          className="absolute top-6 left-6 h-0.5 bg-primary -z-10"
          initial={{ width: 0 }}
          animate={{
            width: totalSteps > 1 ? `${(currentStep - 1) / (totalSteps - 1) * 100}%` : '0%'
          }}
          transition={{
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1]
          }}
        />

        {/* Steps Grid */}
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${Math.min(totalSteps, 5)}, 1fr)`
          }}
        >
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const state = getStepState(stepNumber);

            return (
              <div key={stepNumber} className="flex flex-col items-center">
                <motion.button
                  onClick={() => handleStepClick(stepNumber)}
                  className={cn(
                    "relative w-12 h-12 rounded-full border-2 flex items-center justify-center",
                    "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "hover:scale-105 active:scale-95",
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
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.span
                      className="text-sm font-semibold"
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
                
                {/* Step Label for larger screens */}
                <div className="mt-3 text-center hidden sm:block">
                  <span className={cn(
                    "text-xs font-medium",
                    {
                      'text-primary': state === 'completed' || state === 'current',
                      'text-muted-foreground': state === 'upcoming'
                    }
                  )}>
                    Step {stepNumber}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Step Navigation */}
      <div className="flex justify-between mt-8 sm:hidden">
        <button
          onClick={() => handleStepClick(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            currentStep === 1
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          Previous
        </button>
        
        <button
          onClick={() => handleStepClick(Math.min(totalSteps, currentStep + 1))}
          disabled={currentStep === totalSteps}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            currentStep === totalSteps
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StepProgressIndicator;