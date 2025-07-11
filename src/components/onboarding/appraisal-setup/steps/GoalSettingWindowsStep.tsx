
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Trash2, AlertCircle, Target, Clock } from "lucide-react";
import { CycleData } from "../types";
import { ValidationErrors } from "../validation";
import { toast } from "sonner";

interface GoalSettingWindowsStepProps {
  data: CycleData;
  onDataChange: (updates: Partial<CycleData>) => void;
  errors: ValidationErrors;
}

export const GoalSettingWindowsStep = ({ data, onDataChange, errors }: GoalSettingWindowsStepProps) => {
  const [newWindow, setNewWindow] = useState({
    name: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });

  const addGoalWindow = () => {
    if (!newWindow.name || !newWindow.startDate || !newWindow.endDate) {
      toast.error("Please fill in all fields for the goal setting window");
      return;
    }

    if (newWindow.endDate <= newWindow.startDate) {
      toast.error("End date must be after start date");
      return;
    }

    const window = {
      id: `gsw-${Date.now()}`,
      name: newWindow.name,
      startDate: newWindow.startDate,
      endDate: newWindow.endDate,
    };

    onDataChange({
      goalSettingWindows: [...data.goalSettingWindows, window]
    });

    setNewWindow({
      name: '',
      startDate: undefined,
      endDate: undefined,
    });

    toast.success("Goal setting window added");
  };

  const removeGoalWindow = (id: string) => {
    // Check if any review periods depend on this window
    const dependentPeriods = data.reviewPeriods.filter(period => period.goalWindowId === id);
    if (dependentPeriods.length > 0) {
      toast.error(`Cannot remove window. It's linked to ${dependentPeriods.length} review period(s)`);
      return;
    }

    onDataChange({
      goalSettingWindows: data.goalSettingWindows.filter(window => window.id !== id)
    });
    toast.success("Goal setting window removed");
  };

  const getPresetWindows = () => {
    const currentYear = new Date().getFullYear();
    return [
      {
        name: "Q1 Goal Setting",
        startDate: new Date(currentYear, 0, 1), // Jan 1
        endDate: new Date(currentYear, 0, 31),  // Jan 31
      },
      {
        name: "Q2 Goal Setting", 
        startDate: new Date(currentYear, 3, 1), // Apr 1
        endDate: new Date(currentYear, 3, 30), // Apr 30
      },
      {
        name: "Annual Goal Setting",
        startDate: new Date(currentYear, 0, 1), // Jan 1
        endDate: new Date(currentYear, 1, 28), // Feb 28
      }
    ];
  };

  const addPresetWindow = (preset: typeof newWindow) => {
    setNewWindow(preset);
  };

  const handleSaveDraft = () => {
    // This will be passed down from the parent AppraisalWizard component
    toast.success("Draft saved successfully");
  };

  return (
    <div className="space-y-6">
      {/* Header with Save Draft button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-semibold">Goal Setting Windows</h2>
        </div>
        <Button
          variant="outline"
          onClick={handleSaveDraft}
        >
          Save Draft
        </Button>
      </div>

      {/* Description */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            Define time periods when employees and managers can set, modify, or review goals. 
            These windows provide structure to your goal-setting process.
          </p>
        </CardContent>
      </Card>

      {/* Current Goal Windows */}
      {data.goalSettingWindows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configured Windows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.goalSettingWindows.map((window, index) => (
                <div key={window.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{window.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {window.startDate.toLocaleDateString()}
                        </span>
                        <span>to</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {window.endDate.toLocaleDateString()}
                        </span>
                        <Badge variant="outline">
                          {Math.ceil((window.endDate.getTime() - window.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeGoalWindow(window.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Window */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Goal Setting Window</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Presets */}
          <div>
            <Label className="text-sm font-medium">Quick Presets</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {getPresetWindows().map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => addPresetWindow(preset)}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Manual Entry */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="windowName">Window Name *</Label>
              <Input
                id="windowName"
                value={newWindow.name}
                onChange={(e) => setNewWindow({ ...newWindow, name: e.target.value })}
                placeholder="e.g., Q1 Goal Setting"
              />
            </div>
            <div>
              <Label>Start Date *</Label>
              <DatePicker
                date={newWindow.startDate}
                onDateChange={(date) => setNewWindow({ ...newWindow, startDate: date })}
                placeholder="Select start date"
              />
            </div>
            <div>
              <Label>End Date *</Label>
              <DatePicker
                date={newWindow.endDate}
                onDateChange={(date) => setNewWindow({ ...newWindow, endDate: date })}
                placeholder="Select end date"
              />
            </div>
          </div>

          <Button onClick={addGoalWindow} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Goal Setting Window
          </Button>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {errors.goalSettingWindows && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Validation Error</span>
            </div>
            <p className="text-sm text-destructive mt-1">
              {errors.goalSettingWindows[0]}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium mb-2">Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Allow at least 2-4 weeks for goal setting activities</li>
                <li>• Schedule goal windows before review periods</li>
                <li>• Consider organizational calendar (holidays, busy periods)</li>
                <li>• Provide buffer time between goal setting and review periods</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
