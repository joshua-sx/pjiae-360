
import { Milestone } from "./OnboardingMilestones";
import StepProgressIndicator from "./components/StepProgressIndicator";
import { Container } from "@/components/ui/Container";

interface MilestoneHeaderProps {
  milestone: Milestone;
  progress: number;
  currentStep: number;
  totalSteps: number;
  completedSteps?: Set<number>;
  onStepClick?: (stepIndex: number) => void;
  milestones?: Milestone[];
}

const MilestoneHeader = ({ 
  milestone, 
  progress, 
  currentStep, 
  totalSteps, 
  completedSteps = new Set(),
  onStepClick,
  milestones
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
    <div className="sticky top-0 z-sticky bg-background w-full border-b border-border/50">
      <div className="safe-area-top">
        <Container fullBleedScroll>
          <StepProgressIndicator
            totalSteps={totalSteps}
            currentStep={currentStep + 1}
            onStepClick={handleStepClick}
            className="py-3 sm:py-4"
            steps={milestones?.map(m => ({ title: m.title, icon: m.icon }))}
            labelMode="step"
          />
        </Container>
      </div>
    </div>
  );
};

export default MilestoneHeader;
