
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Info } from "lucide-react";
import { CycleData } from "../types";
import { ValidationErrors } from "../validation";
import { GoalWindowsList } from "./goal-setting-windows/GoalWindowsList";
import { CollapsibleAddForm } from "./goal-setting-windows/CollapsibleAddForm";
import { ValidationError } from "./goal-setting-windows/ValidationError";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      {/* Main Card Container */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle className="text-2xl font-semibold">Goal Setting Windows</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <div className="space-y-2">
                    <p className="font-medium">Best Practices</p>
                    <ul className="text-sm space-y-1">
                      <li>• Allow at least 2-4 weeks for goal setting activities</li>
                      <li>• Schedule goal windows before review periods</li>
                      <li>• Consider organizational calendar (holidays, busy periods)</li>
                      <li>• Provide buffer time between goal setting and review periods</li>
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Description */}
          <p className="text-muted-foreground">
            Define time periods when employees and managers can set, modify, or review goals. 
            These windows provide structure to your goal-setting process.
          </p>

          {/* Current Goal Windows */}
          <GoalWindowsList 
            goalSettingWindows={data.goalSettingWindows}
            reviewPeriods={data.reviewPeriods}
            onRemove={handleRemoveWindow}
            onEdit={handleEditWindow}
          />

          {/* Collapsible Add Form */}
          <CollapsibleAddForm onAdd={handleAddWindow} />
        </CardContent>
      </Card>

      {/* Validation Errors */}
      <ValidationError errors={errors} />
    </div>
  );
};
