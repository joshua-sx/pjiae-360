import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import ProgressIndicator from "./ProgressIndicator";
import { SelectEmployees } from "./steps/SelectEmployees";
import { GoalDetails } from "./steps/GoalDetails";
import { Review } from "./steps/Review";
import { Success } from "./steps/Success";
import { useMagicPathGoal } from "@/hooks/useMagicPathGoal";
import type { MagicPathGoalCreatorProps } from "./types";

const MagicPathGoalCreator = ({ onComplete }: MagicPathGoalCreatorProps) => {
  const {
    currentStep,
    goalData,
    employees,
    employeesLoading,
    handleNext,
    handleBack,
    handleEmployeeSelection,
    handleGoalDetailsChange,
    canProceed,
    createGoal,
    isLoading,
  } = useMagicPathGoal(onComplete);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SelectEmployees
            employees={employees}
            selectedEmployees={goalData.selectedEmployees}
            loading={employeesLoading}
            onSelect={handleEmployeeSelection}
          />
        );
      case 2:
        return (
          <GoalDetails goalData={goalData} onChange={handleGoalDetailsChange} />
        );
      case 3:
        return <Review goalData={goalData} />;
      case 4:
        return <Success goalData={goalData} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-background rounded-xl border border-border">
      <ProgressIndicator currentStep={currentStep} totalSteps={4} />
      {renderStep()}
      {currentStep < 4 && (
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center text-sm disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </button>
          {currentStep === 3 ? (
            <button
              onClick={createGoal}
              disabled={isLoading}
              className="flex items-center text-sm"
            >
              {isLoading ? "Creating..." : "Create Goal"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center text-sm disabled:opacity-50"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MagicPathGoalCreator;
