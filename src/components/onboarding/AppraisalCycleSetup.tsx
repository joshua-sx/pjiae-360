
"use client";

import OnboardingStepLayout from "./components/OnboardingStepLayout";
import { OnboardingData } from "./OnboardingTypes";
import { SimplifiedAppraisalWizard } from "./appraisal-setup/SimplifiedAppraisalWizard";
import { CycleData } from "./appraisal-setup/types";

interface AppraisalCycleSetupProps {
  data: OnboardingData;
  onDataChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const AppraisalCycleSetup = ({ data, onDataChange, onNext, onBack }: AppraisalCycleSetupProps) => {
  const handleComplete = async (cycleData: CycleData) => {
    // Add any missing properties for backward compatibility
    const completeData = {
      ...cycleData,
      // Note: visibility has been removed from the cycle data structure
    };
    onDataChange({ appraisalCycle: completeData });
    onNext();
  };

  const handleSaveDraft = async (cycleData: CycleData) => {
    // Add any missing properties for backward compatibility
    const completeData = {
      ...cycleData,
      // Note: visibility has been removed from the cycle data structure
    };
    onDataChange({ appraisalCycle: completeData });
  };

  return (
    <OnboardingStepLayout
      onBack={onBack}
      onNext={() => {}} 
      nextLabel="Complete Setup"
      nextDisabled={true}
      maxWidth="2xl"
    >
      <SimplifiedAppraisalWizard
        initialData={data.appraisalCycle}
        onComplete={handleComplete}
        onSaveDraft={handleSaveDraft}
      />
    </OnboardingStepLayout>
  );
};

export default AppraisalCycleSetup;
