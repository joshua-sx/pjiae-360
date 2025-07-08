"use client";

import { useState } from "react";
import { toast } from "sonner";
import { OnboardingData } from "./OnboardingTypes";
import OnboardingStepLayout from "./components/OnboardingStepLayout";
import { FrequencySelection } from "./appraisal-setup/FrequencySelection";
import { StartDateSelection } from "./appraisal-setup/StartDateSelection";
import { VisibilitySettings } from "./appraisal-setup/VisibilitySettings";
import { CompetencySettings } from "./appraisal-setup/CompetencySettings";
import { NotificationSettings } from "./appraisal-setup/NotificationSettings";
import { ConfigurationSummary } from "./appraisal-setup/ConfigurationSummary";
import { CycleData, defaultCycleData } from "./appraisal-setup/types";

interface AppraisalCycleSetupProps {
  data: OnboardingData;
  onDataChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const AppraisalCycleSetup = ({ data, onDataChange, onNext, onBack }: AppraisalCycleSetupProps) => {
  const [cycleData, setCycleData] = useState<CycleData>(() => {
    if (data.appraisalCycle) {
      return {
        ...defaultCycleData,
        ...data.appraisalCycle,
        startDate: data.appraisalCycle.startDate || defaultCycleData.startDate,
        visibility: data.appraisalCycle.visibility ?? defaultCycleData.visibility
      };
    }
    return defaultCycleData;
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveAndNext = async () => {
    setIsLoading(true);
    try {
      // Save the appraisal cycle data to the onboarding data
      onDataChange({ appraisalCycle: cycleData });
      
      // Simulate saving process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Appraisal cycle configuration saved!");
      onNext();
    } catch (error) {
      toast.error("Failed to save configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFrequencyChange = (frequency: "annual" | "bi-annual") => {
    setCycleData(prev => ({ ...prev, frequency }));
  };

  const handleDateChange = (date: Date | undefined) => {
    const startDate = date ? date.toISOString().split('T')[0] : '';
    setCycleData(prev => ({ ...prev, startDate }));
  };

  const handleVisibilityChange = (visibility: boolean) => {
    setCycleData(prev => ({ ...prev, visibility }));
  };

  const handleCompetencyChange = (updates: Partial<CycleData['competencyCriteria']>) => {
    setCycleData(prev => ({
      ...prev,
      competencyCriteria: { ...prev.competencyCriteria, ...updates }
    }));
  };

  const handleNotificationChange = (updates: Partial<CycleData['notifications']>) => {
    setCycleData(prev => ({
      ...prev,
      notifications: { ...prev.notifications, ...updates }
    }));
  };

  return (
    <OnboardingStepLayout
      onNext={handleSaveAndNext}
      onBack={onBack}
      nextLabel={isLoading ? "Saving..." : "Save & Continue"}
      nextDisabled={isLoading}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-bold">Set Up Appraisal Cycle</h2>
          <p className="text-muted-foreground">
            Configure your organization's performance review cycle and evaluation criteria.
          </p>
        </div>

        <FrequencySelection 
          frequency={cycleData.frequency}
          onFrequencyChange={handleFrequencyChange}
        />

        <StartDateSelection 
          startDate={cycleData.startDate}
          frequency={cycleData.frequency}
          onDateChange={handleDateChange}
        />

        <VisibilitySettings 
          visibility={cycleData.visibility}
          onVisibilityChange={handleVisibilityChange}
        />

        <CompetencySettings 
          competencyCriteria={cycleData.competencyCriteria}
          onCompetencyChange={handleCompetencyChange}
        />

        <NotificationSettings 
          notifications={cycleData.notifications}
          onNotificationChange={handleNotificationChange}
        />

        <ConfigurationSummary 
          frequency={cycleData.frequency}
          startDate={cycleData.startDate}
          visibility={cycleData.visibility}
          competencyCriteria={cycleData.competencyCriteria}
          notifications={cycleData.notifications}
        />
      </div>
    </OnboardingStepLayout>
  );
};

export default AppraisalCycleSetup;
