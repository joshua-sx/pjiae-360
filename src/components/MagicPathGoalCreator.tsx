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

export function MagicPathGoalCreator({ onComplete }: MagicPathGoalCreatorProps): JSX.Element {
  const [goalData, setGoalData] = useState<GoalData>({
    title: '',
    description: '',
    assignee: '',
    selectedEmployee: null,
    selectedEmployees: [],
    dueDate: undefined,
    priority: 'Medium'
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps: GoalCreationStep[] = [
    {
      title: "Select Employees",
      subtitle: "Choose team members who will work on this goal",
      fields: ['assignee']
    },
    {
      title: "Goal Details",
      subtitle: "Define the goal title and description",
      fields: ['title', 'description']
    },
    {
      title: "Schedule & Priority",
      subtitle: "Set optional due date and priority level",
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
      // Step 2 (Additional details) - due date and priority are optional
      if (stepIndex === 2 && (field === 'dueDate' || field === 'priority')) return true;
      if (field === 'assignee') return goalData.selectedEmployees.length > 0;
      return goalData[field] !== '';
    });
  };

  const canProceed = isStepComplete(currentStep);

  const updateGoalData = <K extends keyof GoalData>(field: K, value: GoalData[K]) => {
    setGoalData(prev => ({ ...prev, [field]: value }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <GoalAssignmentStep
            assignee={goalData.assignee}
            selectedEmployee={goalData.selectedEmployee}
            selectedEmployees={goalData.selectedEmployees}
            onAssigneeChange={(value) => updateGoalData('assignee', value)}
            onEmployeeSelect={(employee) => updateGoalData('selectedEmployee', employee)}
            onEmployeesSelect={(employees) => updateGoalData('selectedEmployees', employees)}
          />
        );
      case 1:
        return (
          <GoalBasicsStep
            title={goalData.title}
            description={goalData.description}
            onTitleChange={(value) => updateGoalData('title', value)}
            onDescriptionChange={(value) => updateGoalData('description', value)}
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
    <div className="space-y-8">
      <GoalProgressIndicator 
        currentStep={currentStep} 
        totalSteps={steps.length} 
      />
      
      <div className="max-w-3xl mx-auto">
        {renderStepContent()}
      </div>
      
      <div className="max-w-3xl mx-auto">
        <GoalNavigationButtons
          currentStep={currentStep}
          totalSteps={steps.length}
          canProceed={canProceed}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}