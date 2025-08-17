
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
    <div className={cn("w-full mx-auto px-3 sm:px-4 max-w-md sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl", className)}>
      {/* Mobile: Simple current step indicator */}
      <div className="block sm:hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <span className="text-sm font-medium">{currentStep}</span>
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

      {/* Tablet/Desktop: Enhanced step indicators */}
      <div className="hidden sm:block">
        <div className="w-full overflow-x-auto">
          <div className="flex items-center justify-center flex-nowrap gap-2.5 sm:gap-3 md:gap-4 lg:gap-5">
            {Array.from({ length: totalSteps }, (_, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;
              const isUpcoming = stepNumber > currentStep;

              return (
                <React.Fragment key={stepNumber}>
                  <div className="flex flex-col items-center">
                    <motion.button
                      onClick={() => handleStepClick(stepNumber)}
                      className={cn(
                        "relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold",
                        "transition-all duration-300 ease-in-out focus:outline-none",
                        {
                          'bg-primary text-primary-foreground shadow-lg shadow-primary/20': isActive,
                          'bg-foreground text-background': isCompleted,
                          'bg-muted text-muted-foreground border-2 border-border': isUpcoming
                        }
                      )}
                      initial={false}
                      animate={{
                        scale: isActive ? 1.1 : 1
                      }}
                      transition={{
                        duration: 0.2
                      }}
                      aria-label={`Step ${stepNumber}${
                        isCompleted ? ' completed' : 
                        isActive ? ' current' : ''
                      }`}
                      aria-current={isActive ? 'step' : undefined}
                    >
                      {isCompleted ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Check size={16} />
                        </motion.div>
                      ) : (
                        <span>{stepNumber}</span>
                      )}
                      
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-primary opacity-20"
                          initial={{ scale: 1 }}
                          animate={{ scale: 1.4 }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        />
                      )}
                    </motion.button>
                    
                    <div className="mt-2 text-center">
                      <p className={cn(
                        "text-xs font-medium",
                        {
                          'text-primary': isActive,
                          'text-foreground': isCompleted,
                          'text-muted-foreground': isUpcoming
                        }
                      )}>
                        Step {stepNumber}
                      </p>
                    </div>
                  </div>
                  
                  {index < totalSteps - 1 && (
                    <div className="w-8 sm:w-10 md:w-12 lg:w-16 xl:w-20 shrink-0 mx-1 sm:mx-1.5 md:mx-2">
                      <div className={cn(
                        "h-0.5 transition-all duration-500 ease-in-out",
                        {
                          'bg-foreground': isCompleted,
                          'bg-border': !isCompleted
                        }
                      )} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StepProgressIndicator;
