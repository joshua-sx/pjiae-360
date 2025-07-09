"use client";

import { OnboardingData } from "./OnboardingTypes";
import OnboardingStepLayout from "./components/OnboardingStepLayout";
import { AppraisalWizard } from "./appraisal-setup/AppraisalWizard";
import { CycleData } from "./appraisal-setup/types";

interface AppraisalCycleSetupProps {
  data: OnboardingData;
  onDataChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const AppraisalCycleSetup = ({ data, onDataChange, onNext, onBack }: AppraisalCycleSetupProps) => {
  const handleComplete = async (cycleData: CycleData) => {
    onDataChange({ appraisalCycle: cycleData });
    onNext();
  };

  const handleSaveDraft = async (cycleData: CycleData) => {
    onDataChange({ appraisalCycle: cycleData });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppraisalWizard
        initialData={data.appraisalCycle}
        onComplete={handleComplete}
        onSaveDraft={handleSaveDraft}
      />
    </div>
  );
};

export default AppraisalCycleSetup;
