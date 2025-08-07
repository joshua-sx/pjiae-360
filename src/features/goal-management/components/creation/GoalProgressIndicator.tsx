import React from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function GoalProgressIndicator({ 
  currentStep, 
  totalSteps 
}: GoalProgressIndicatorProps): JSX.Element {
  return (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index} className="flex items-center">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ease-in-out",
            index < currentStep 
              ? "bg-success text-success-foreground shadow-md" 
              : index === currentStep 
                ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}>
            {index < currentStep ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <span className="font-semibold">{index + 1}</span>
            )}
          </div>
          {index < totalSteps - 1 && (
            <div className={cn(
              "w-16 h-1 mx-3 rounded-full transition-all duration-300 ease-in-out",
              index < currentStep 
                ? "bg-success" 
                : "bg-border"
            )} />
          )}
        </div>
      ))}
    </div>
  );
}