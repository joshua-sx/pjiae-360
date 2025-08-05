import React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface SignatureStep {
  id: string;
  label: string;
  completed: boolean;
}

interface SignatureStepsProps {
  steps: SignatureStep[];
}

export const SignatureSteps = ({ steps }: SignatureStepsProps) => {
  const currentStep = steps.findIndex(step => !step.completed);
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                step.completed
                  ? "bg-green-500 text-primary-foreground"
                  : index === currentStep
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step.completed ? <Check size={16} /> : index + 1}
            </div>
            <span
              className={cn(
                "text-sm hidden sm:inline",
                step.completed
                  ? "text-green-600"
                  : index === currentStep
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 transition-all",
                step.completed ? "bg-green-500" : "bg-muted"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

