
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
    <div className={cn("w-full", className)}>
      {/* Unified step indicators for all screen sizes */}
      <div className="w-full overflow-x-auto px-3 sm:px-4">
        <div className="flex items-center justify-start flex-nowrap gap-1.5 sm:gap-2.5 md:gap-3 lg:gap-4 xl:gap-5 min-w-max">
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
                         "relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold",
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
                          <Check size={12} className="sm:w-4 sm:h-4" />
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
                    
                     <div className="mt-1 sm:mt-2 text-center">
                       <p className={cn(
                         "text-xs sm:text-xs font-medium",
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
                    <div className="w-4 sm:w-8 md:w-10 lg:w-12 xl:w-16 shrink-0 mx-0.5 sm:mx-1 md:mx-1.5">
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
  );
}

export default StepProgressIndicator;
