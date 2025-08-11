
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CycleData, defaultCycleData } from "./types";
import { GoalSettingWindowsStep } from "./steps/GoalSettingWindowsStep";
import AppraisalHeader from "./components/AppraisalHeader";
import { supabase } from "@/integrations/supabase/client";

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
      // Resolve current organization
      const { data: orgId, error: orgError } = await supabase.rpc('get_current_user_org_id');
      if (orgError || !orgId) throw new Error('Unable to determine organization.');

      const fmt = (d: string | Date) => {
        const date = d instanceof Date ? d : new Date(d);
        return date.toISOString().split('T')[0];
      };

      // Compute cycle end_date from the latest of windows/reviews
      const candidates = [
        ...((cycleData.goalSettingWindows || []).map(w => w.endDate)),
        ...((cycleData.reviewPeriods || []).map(r => r.endDate)),
      ];
      const maxTs = candidates.length ? Math.max(...candidates.map(d => new Date(d).getTime())) : new Date(cycleData.startDate).getTime();
      const endDate = fmt(new Date(maxTs));

      // Create appraisal cycle
      const { data: cycleRow, error: cycleErr } = await supabase
        .from('appraisal_cycles')
        .insert({
          name: cycleData.cycleName,
          description: `${cycleData.frequency} review cycle`,
          start_date: fmt(cycleData.startDate),
          end_date: endDate,
          year: new Date(cycleData.startDate).getFullYear(),
          organization_id: orgId,
          status: 'active',
        })
        .select('id')
        .single();
      if (cycleErr) throw cycleErr;

      // Insert goal setting windows
      if (cycleData.goalSettingWindows?.length) {
        const windowRows = cycleData.goalSettingWindows.map(w => ({
          name: w.name,
          start_date: fmt(w.startDate),
          end_date: fmt(w.endDate),
          cycle_id: cycleRow.id,
        }));
        const { error: winErr } = await supabase.from('goal_setting_windows').insert(windowRows);
        if (winErr) throw winErr;
      }

      await onComplete(cycleData);
      toast.success('Appraisal cycle configuration completed!');
    } catch (error) {
      console.error('Failed to save configuration', error);
      toast.error('Failed to save configuration');
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
