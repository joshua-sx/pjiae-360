import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface GoalNavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function GoalNavigationButtons({
  currentStep,
  totalSteps,
  canProceed,
  onPrevious,
  onNext
}: GoalNavigationButtonsProps): JSX.Element {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex justify-between pt-6 border-t">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 0}
      >
        Previous
      </Button>
      <Button
        onClick={onNext}
        disabled={!canProceed}
        className="gap-2"
      >
        {isLastStep ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Create Goal
          </>
        ) : (
          <>
            Next
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </div>
  );
}