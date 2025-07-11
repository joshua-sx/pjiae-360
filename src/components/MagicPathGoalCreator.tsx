import React, { useState } from 'react';
import { toast } from 'sonner';
import { GoalProgressIndicator } from './goals/creation/GoalProgressIndicator';
import { GoalBasicsStep } from './goals/creation/GoalBasicsStep';
import { GoalAssignmentStep } from './goals/creation/GoalAssignmentStep';
import { GoalSchedulingStep } from './goals/creation/GoalSchedulingStep';
import { GoalNavigationButtons } from './goals/creation/GoalNavigationButtons';
import { GoalData, GoalCreationStep } from './goals/creation/types';

interface MagicPathGoalCreatorProps {
  onComplete?: (goalData: GoalData) => void;
}

export const MagicPathGoalCreator: React.FC<MagicPathGoalCreatorProps> = ({ onComplete }) => {
  const [goalData, setGoalData] = useState<GoalData>({
    title: '',
    description: '',
    assignee: '',
    selectedEmployee: null,
    dueDate: undefined,
    priority: 'Medium',
    type: 'individual'
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps: GoalCreationStep[] = [
    {
      title: "What's your goal?",
      subtitle: "Let's start with the basics",
      fields: ['title', 'description']
    },
    {
      title: "Who's responsible?",
      subtitle: "Assign ownership and set timeline",
      fields: ['assignee', 'type']
    },
    {
      title: "When and how important?",
      subtitle: "Set deadline and priority level",
      fields: ['dueDate', 'priority']
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  const handleComplete = () => {
    toast.success("Goal created successfully!");
    onComplete?.(goalData);
  };

  const isStepComplete = (stepIndex: number) => {
    const step = steps[stepIndex];
    return step.fields.every(field => {
      if (field === 'dueDate') return goalData.dueDate !== undefined;
      if (field === 'assignee') return goalData.type === 'team' ? goalData.assignee !== '' : goalData.selectedEmployee !== null;
      return goalData[field] !== '';
    });
  };

  const canProceed = isStepComplete(currentStep);

  const updateGoalData = (field: keyof GoalData, value: any) => {
    setGoalData(prev => ({ ...prev, [field]: value }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <GoalBasicsStep
            title={goalData.title}
            description={goalData.description}
            onTitleChange={(value) => updateGoalData('title', value)}
            onDescriptionChange={(value) => updateGoalData('description', value)}
          />
        );
      case 1:
        return (
          <GoalAssignmentStep
            type={goalData.type}
            assignee={goalData.assignee}
            selectedEmployee={goalData.selectedEmployee}
            onTypeChange={(value) => updateGoalData('type', value)}
            onAssigneeChange={(value) => updateGoalData('assignee', value)}
            onEmployeeSelect={(employee) => updateGoalData('selectedEmployee', employee)}
          />
        );
      case 2:
        return (
          <GoalSchedulingStep
            dueDate={goalData.dueDate}
            priority={goalData.priority}
            onDueDateChange={(value) => updateGoalData('dueDate', value)}
            onPriorityChange={(value) => updateGoalData('priority', value)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <GoalProgressIndicator 
        currentStep={currentStep} 
        totalSteps={steps.length} 
      />
      
      {renderStepContent()}
      
      <GoalNavigationButtons
        currentStep={currentStep}
        totalSteps={steps.length}
        canProceed={canProceed}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </div>
  );
};