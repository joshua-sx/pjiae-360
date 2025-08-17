
import { Milestone } from "./OnboardingMilestones";
import StepProgressIndicator from "./components/StepProgressIndicator";

interface MilestoneHeaderProps {
  milestone: Milestone;
  progress: number;
  currentStep: number;
  totalSteps: number;
  completedSteps?: Set<number>;
  onStepClick?: (stepIndex: number) => void;
}

const MilestoneHeader = ({ 
  milestone, 
  progress, 
  currentStep, 
  totalSteps, 
  completedSteps = new Set(),
  onStepClick
}: MilestoneHeaderProps) => {
  // Handle step click with proper 1-based indexing
  const handleStepClick = (step: number) => {
    const stepIndex = step - 1; // Convert 1-based to 0-based indexing
    
    // Only allow navigation to completed steps or the next step
    if (completedSteps.has(stepIndex) || stepIndex === currentStep) {
      onStepClick?.(stepIndex);
    }
  };

  return (
    <div className="sticky top-0 z-sticky bg-background w-full">
      <div className="safe-area-top">
        <StepProgressIndicator
          totalSteps={totalSteps}
          currentStep={currentStep + 1}
          onStepClick={handleStepClick}
          className="py-3 sm:py-4"
        />
      </div>
    </div>
  );
};

export default MilestoneHeader;
