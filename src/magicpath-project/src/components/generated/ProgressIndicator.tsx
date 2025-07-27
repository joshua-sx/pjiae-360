import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';
interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}
const stepLabels = ['Select Team', 'Goal Details', 'Timeline & Metrics'];
const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps
}) => {
  return <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        {Array.from({
        length: totalSteps
      }, (_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isUpcoming = stepNumber > currentStep;
        return <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center">
                <motion.div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors duration-200", isCompleted && "bg-primary text-primary-foreground", isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20", isUpcoming && "bg-muted text-muted-foreground border-2 border-border")} initial={false} animate={{
              scale: isCurrent ? 1.1 : 1
            }} transition={{
              duration: 0.2
            }}>
                  {isCompleted ? <Check className="h-5 w-5" /> : <span>{stepNumber}</span>}
                </motion.div>
                <span className={cn("mt-2 text-xs font-medium text-center max-w-20", isCurrent ? "text-primary" : "text-muted-foreground")}>
                  {stepLabels[index]}
                </span>
              </div>
              
              {index < totalSteps - 1 && <div className="flex-1 mx-4">
                  <div className="h-0.5 bg-border relative">
                    <motion.div className="h-full bg-primary" initial={{
                width: '0%'
              }} animate={{
                width: stepNumber < currentStep ? '100%' : '0%'
              }} transition={{
                duration: 0.3,
                delay: 0.1
              }} />
                  </div>
                </div>}
            </React.Fragment>;
      })}
      </div>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </p>
      </div>
    </div>;
};
export default ProgressIndicator;