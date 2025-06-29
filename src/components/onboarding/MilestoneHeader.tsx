
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle } from "lucide-react";
import { Milestone } from "./OnboardingMilestones";

interface MilestoneHeaderProps {
  milestone: Milestone;
  progress: number;
  currentStep: number;
  totalSteps: number;
  completedSteps?: Set<number>;
}

const MilestoneHeader = ({ milestone, progress, currentStep, totalSteps, completedSteps = new Set() }: MilestoneHeaderProps) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStep - 1;
            
            return (
              <div
                key={index}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : isCompleted
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <Circle className="w-3 h-3" />
                )}
                <span>{stepNumber}</span>
              </div>
            );
          })}
        </div>

        {/* Current milestone info */}
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-gray-900">{milestone.title}</h1>
          <p className="text-gray-600 mt-1">{milestone.description}</p>
        </div>
      </div>
    </div>
  );
};

export default MilestoneHeader;
