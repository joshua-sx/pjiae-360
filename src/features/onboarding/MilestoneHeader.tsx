
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { OnboardingMilestone } from './OnboardingTypes';

interface MilestoneHeaderProps {
  milestone: OnboardingMilestone;
  progress: number;
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
}

const MilestoneHeader: React.FC<MilestoneHeaderProps> = ({
  milestone,
  progress,
  currentStep,
  totalSteps,
  completedSteps
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Milestone Info */}
        <div className="flex items-center gap-4">
          <div className="text-3xl">{milestone.icon}</div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {milestone.title}
            </h1>
            <p className="text-gray-600 mt-1">
              {milestone.description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              Estimated time: {milestone.estimatedTime}
            </div>
            {milestone.isOptional && (
              <div className="text-xs text-blue-600 mt-1">Optional</div>
            )}
          </div>
        </div>

        {/* Steps Indicator */}
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {Array.from({ length: totalSteps }, (_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  completedSteps.includes(index)
                    ? 'bg-green-500'
                    : index === currentStep - 1
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneHeader;
