
import { Card, CardContent } from "@/components/ui/card";
import { Target } from "lucide-react";
import { CycleData } from "../types";
import { ValidationErrors } from "../validation";
import { GoalWindowsList } from "./goal-setting-windows/GoalWindowsList";
import { AddWindowForm } from "./goal-setting-windows/AddWindowForm";
import { BestPracticesCard } from "./goal-setting-windows/BestPracticesCard";
import { ValidationError } from "./goal-setting-windows/ValidationError";

interface GoalSettingWindowsStepProps {
  data: CycleData;
  onDataChange: (updates: Partial<CycleData>) => void;
  errors: ValidationErrors;
}

export const GoalSettingWindowsStep = ({ data, onDataChange, errors }: GoalSettingWindowsStepProps) => {
  const handleAddWindow = (window: { id: string; name: string; startDate: Date; endDate: Date }) => {
    onDataChange({
      goalSettingWindows: [...data.goalSettingWindows, window]
    });
  };

  const handleRemoveWindow = (id: string) => {
    onDataChange({
      goalSettingWindows: data.goalSettingWindows.filter(window => window.id !== id)
    });
  };

  const handleEditWindow = (id: string, updatedWindow: { name: string; startDate: Date; endDate: Date }) => {
    onDataChange({
      goalSettingWindows: data.goalSettingWindows.map(window => 
        window.id === id ? { ...window, ...updatedWindow } : window
      )
    });
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-semibold">Goal Setting Windows</h2>
      </div>

      {/* Current Goal Windows */}
      <GoalWindowsList 
        goalSettingWindows={data.goalSettingWindows}
        reviewPeriods={data.reviewPeriods}
        onRemove={handleRemoveWindow}
        onEdit={handleEditWindow}
      />

      {/* Description */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            Define time periods when employees and managers can set, modify, or review goals. 
            These windows provide structure to your goal-setting process.
          </p>
        </CardContent>
      </Card>

      {/* Add New Window */}
      <AddWindowForm onAdd={handleAddWindow} />

      {/* Validation Errors */}
      <ValidationError errors={errors} />

      {/* Help Text */}
      <BestPracticesCard />
    </div>
  );
};
