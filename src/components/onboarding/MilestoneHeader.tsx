
import { Milestone } from "./OnboardingMilestones";
import StepProgressIndicator from "./components/StepProgressIndicator";
import { PageContainer as Container } from "@/components/ui/page";

interface MilestoneHeaderProps {
  milestone: Milestone;
  progress: number;
  currentStep: number;
  totalSteps: number;
  completedStepIds?: Set<string>;
  onStepClick?: (stepIndex: number) => void;
  milestones?: Milestone[];
}

const MilestoneHeader = ({ 
  milestone, 
  progress, 
  currentStep, 
  totalSteps, 
  completedStepIds = new Set(),
  onStepClick,
  milestones
}: MilestoneHeaderProps) => {
  // Handle step click with proper 1-based indexing
  const handleStepClick = (step: number) => {
    const stepIndex = step - 1; // Convert 1-based to 0-based indexing
    
    // Allow navigation to completed steps, current step, or the next step
    const targetMilestone = milestones?.[stepIndex];
    if (targetMilestone && (
      completedStepIds.has(targetMilestone.id) || 
      stepIndex === currentStep ||
      stepIndex === currentStep + 1
    )) {
      onStepClick?.(stepIndex);
    }
  };

  return (
    <div className="sticky top-0 z-sticky bg-background w-full border-b border-border/50">
      <div className="safe-area-top">
        <Container size="full">
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
