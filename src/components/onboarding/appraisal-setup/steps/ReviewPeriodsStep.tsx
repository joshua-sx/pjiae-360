import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Trash2, AlertCircle, Target, Clock, Link } from "lucide-react";
import { CycleData } from "../types";
import { ValidationErrors } from "../validation";
import { toast } from "sonner";

interface ReviewPeriodsStepProps {
  data: CycleData;
  onDataChange: (updates: Partial<CycleData>) => void;
  errors: ValidationErrors;
}

export const ReviewPeriodsStep = ({ data, onDataChange, errors }: ReviewPeriodsStepProps) => {
  const [newPeriod, setNewPeriod] = useState({
    name: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    goalWindowId: '',
  });

  const addReviewPeriod = () => {
    if (!newPeriod.name || !newPeriod.startDate || !newPeriod.endDate || !newPeriod.goalWindowId) {
      toast.error("Please fill in all fields for the review period");
      return;
    }

    if (newPeriod.endDate <= newPeriod.startDate) {
      toast.error("End date must be after start date");
      return;
    }

    // Check for overlaps with existing periods
    const hasOverlap = data.reviewPeriods.some(period => {
      const newStart = newPeriod.startDate!.getTime();
      const newEnd = newPeriod.endDate!.getTime();
      const existingStart = period.startDate.getTime();
      const existingEnd = period.endDate.getTime();
      
      return (newStart < existingEnd && newEnd > existingStart);
    });

    if (hasOverlap) {
      toast.error("Review periods cannot overlap");
      return;
    }

    const period = {
      id: `rp-${Date.now()}`,
      name: newPeriod.name,
      startDate: newPeriod.startDate,
      endDate: newPeriod.endDate,
      goalWindowId: newPeriod.goalWindowId,
    };

    onDataChange({
      reviewPeriods: [...data.reviewPeriods, period]
    });

    setNewPeriod({
      name: '',
      startDate: undefined,
      endDate: undefined,
      goalWindowId: '',
    });

    toast.success("Review period added");
  };

  const removeReviewPeriod = (id: string) => {
    onDataChange({
      reviewPeriods: data.reviewPeriods.filter(period => period.id !== id)
    });
    toast.success("Review period removed");
  };

  const getPresetPeriods = () => {
    const currentYear = new Date().getFullYear();
    const presets = [];

    if (data.frequency === 'bi-annual') {
      presets.push(
        {
          name: "Mid-Year Review",
          startDate: new Date(currentYear, 5, 1), // June 1
          endDate: new Date(currentYear, 5, 30), // June 30
        },
        {
          name: "Year-End Review",
          startDate: new Date(currentYear, 11, 1), // Dec 1
          endDate: new Date(currentYear, 11, 31), // Dec 31
        }
      );
    } else {
      presets.push({
        name: "Annual Review",
        startDate: new Date(currentYear, 11, 1), // Dec 1
        endDate: new Date(currentYear, 11, 31), // Dec 31
      });
    }

    return presets;
  };

  const addPresetPeriod = (preset: Omit<typeof newPeriod, 'goalWindowId'>) => {
    setNewPeriod({
      ...preset,
      goalWindowId: data.goalSettingWindows[0]?.id || '',
    });
  };

  const getGoalWindowName = (id: string) => {
    return data.goalSettingWindows.find(window => window.id === id)?.name || 'Unknown';
  };

  const sortedPeriods = [...data.reviewPeriods].sort((a, b) => 
    a.startDate.getTime() - b.startDate.getTime()
  );

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Review Periods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Define when performance reviews will take place. Each review period should be linked to a goal setting window 
            and cannot overlap with other review periods.
          </p>
        </CardContent>
      </Card>

      {/* Goal Windows Warning */}
      {data.goalSettingWindows.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">No Goal Setting Windows</span>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              You need to configure goal setting windows before adding review periods. 
              Go back to the previous step to add goal setting windows.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Current Review Periods */}
      {data.reviewPeriods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configured Review Periods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedPeriods.map((period, index) => (
                <div key={period.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h4 className="font-medium">{period.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {period.startDate.toLocaleDateString()}
                        </span>
                        <span>to</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {period.endDate.toLocaleDateString()}
                        </span>
                        <Badge variant="outline">
                          {Math.ceil((period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Link className="w-4 h-4 text-primary" />
                        <span>Linked to: <strong>{getGoalWindowName(period.goalWindowId)}</strong></span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeReviewPeriod(period.id)}
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

      {/* Add New Period */}
      {data.goalSettingWindows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Review Period</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Presets */}
            <div>
              <Label className="text-sm font-medium">Quick Presets</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {getPresetPeriods().map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => addPresetPeriod(preset)}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Manual Entry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="periodName">Review Period Name *</Label>
                <Input
                  id="periodName"
                  value={newPeriod.name}
                  onChange={(e) => setNewPeriod({ ...newPeriod, name: e.target.value })}
                  placeholder="e.g., Mid-Year Review"
                />
              </div>
              <div>
                <Label>Start Date *</Label>
                <DatePicker
                  date={newPeriod.startDate}
                  onDateChange={(date) => setNewPeriod({ ...newPeriod, startDate: date })}
                  placeholder="Select start date"
                />
              </div>
              <div>
                <Label>End Date *</Label>
                <DatePicker
                  date={newPeriod.endDate}
                  onDateChange={(date) => setNewPeriod({ ...newPeriod, endDate: date })}
                  placeholder="Select end date"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Linked Goal Setting Window *</Label>
                <Select
                  value={newPeriod.goalWindowId}
                  onValueChange={(value) => setNewPeriod({ ...newPeriod, goalWindowId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a goal setting window" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.goalSettingWindows.map((window) => (
                      <SelectItem key={window.id} value={window.id}>
                        {window.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={addReviewPeriod} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Review Period
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Validation Errors */}
      {errors.reviewPeriods && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Validation Error</span>
            </div>
            <p className="text-sm text-destructive mt-1">
              {errors.reviewPeriods[0]}
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
                <li>• Allow 2-4 weeks for review activities (self-assessment, manager review, meetings)</li>
                <li>• Ensure review periods don't overlap</li>
                <li>• Schedule reviews after goal setting windows</li>
                <li>• Consider business cycles and peak periods</li>
                <li>• Link each review period to appropriate goal setting window</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};