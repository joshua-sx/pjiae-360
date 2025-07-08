import React from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const GoalProgressIndicator: React.FC<GoalProgressIndicatorProps> = ({
  currentStep,
  totalSteps
}) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index} className="flex items-center">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
            index < currentStep ? "bg-green-500 text-white" :
            index === currentStep ? "bg-primary text-primary-foreground" :
            "bg-muted text-muted-foreground"
          )}>
            {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div className={cn(
              "w-12 h-0.5 mx-2",
              index < currentStep ? "bg-green-500" : "bg-muted"
            )} />
          )}
        </div>
      ))}
    </div>
  );
};