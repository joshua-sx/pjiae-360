
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface GoalNavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  isLoading?: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function GoalNavigationButtons({
  currentStep,
  totalSteps,
  canProceed,
  isLoading,
  onPrevious,
  onNext
}: GoalNavigationButtonsProps): JSX.Element {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex justify-between pt-6 border-t">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={!!isLoading}
      >
        Previous
      </Button>
      <Button
        onClick={onNext}
        disabled={!canProceed || isLoading}
        className="gap-2"
      >
        {isLastStep ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Submit for Approval
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
