
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CycleData, defaultCycleData } from "./types";
import { GoalSettingWindowsStep } from "./steps/GoalSettingWindowsStep";
import AppraisalHeader from "./components/AppraisalHeader";

interface SimplifiedAppraisalWizardProps {
  initialData?: Partial<CycleData>;
  onComplete: (data: CycleData) => void;
  onSaveDraft: (data: CycleData) => void;
}

export const SimplifiedAppraisalWizard = ({ 
  initialData, 
  onComplete, 
  onSaveDraft 
}: SimplifiedAppraisalWizardProps) => {
  const [cycleData, setCycleData] = useState<CycleData>(() => ({
    ...defaultCycleData,
    ...initialData,
  }));
  const [isLoading, setIsLoading] = useState(false);

  const updateCycleData = useCallback((updates: Partial<CycleData>) => {
    setCycleData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleSaveDraft = useCallback(async () => {
    setIsLoading(true);
    try {
      await onSaveDraft(cycleData);
      toast.success("Draft saved successfully");
    } catch (error) {
      toast.error("Failed to save draft");
    } finally {
      setIsLoading(false);
    }
  }, [cycleData, onSaveDraft]);

  const handleComplete = useCallback(async () => {
    setIsLoading(true);
    try {
      await onComplete(cycleData);
      toast.success("Appraisal cycle configuration completed!");
    } catch (error) {
      toast.error("Failed to save configuration");
    } finally {
      setIsLoading(false);
    }
  }, [cycleData, onComplete]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <AppraisalHeader />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <GoalSettingWindowsStep
          data={cycleData}
          onDataChange={updateCycleData}
          errors={{}}
        />
      </motion.div>

      {/* Custom Footer - Overrides OnboardingStepLayout footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-3 py-3 sm:px-6 sm:py-4 pb-safe z-50">
        <div className="w-full max-w-sm sm:max-w-xl md:max-w-2xl mx-auto flex justify-between items-center gap-3 sm:gap-4">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isLoading}
            className="flex-1 h-12 sm:h-11 text-sm sm:text-base touch-manipulation"
            size="lg"
          >
            Save Draft
          </Button>
          <Button
            onClick={handleComplete}
            disabled={isLoading}
            className="flex-1 h-12 sm:h-11 text-sm sm:text-base touch-manipulation"
            size="lg"
          >
            {isLoading ? 'Completing...' : 'Complete Setup'}
          </Button>
        </div>
      </div>
    </div>
  );
};
