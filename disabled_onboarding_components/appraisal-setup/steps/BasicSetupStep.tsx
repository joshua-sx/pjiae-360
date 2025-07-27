import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { CycleData } from "../types";
import { ValidationErrors } from "../validation";

interface BasicSetupStepProps {
  data: CycleData;
  onDataChange: (updates: Partial<CycleData>) => void;
  errors: ValidationErrors;
}

export const BasicSetupStep = ({ data, onDataChange, errors }: BasicSetupStepProps) => {
  const handleFrequencyChange = (frequency: "annual" | "bi-annual") => {
    onDataChange({ frequency });
    
    // Auto-populate review periods based on frequency
    const currentYear = new Date().getFullYear();
    let defaultPeriods: Array<{
      id: string;
      name: string;
      startDate: Date;
      endDate: Date;
      goalWindowId: string;
    }> = [];

    const defaultGoalWindowId = data.goalSettingWindows[0]?.id || "gsw-1";

    if (frequency === "annual") {
      defaultPeriods = [{
        id: `rp-${Date.now()}`,
        name: "Year-End Review",
        startDate: new Date(currentYear, 11, 1), // Dec 1
        endDate: new Date(currentYear, 11, 31), // Dec 31
        goalWindowId: defaultGoalWindowId
      }];
    } else {
      defaultPeriods = [
        {
          id: `rp-${Date.now()}-1`,
          name: "Mid-Year Review",
          startDate: new Date(currentYear, 5, 1), // June 1
          endDate: new Date(currentYear, 5, 30), // June 30
          goalWindowId: defaultGoalWindowId
        },
        {
          id: `rp-${Date.now()}-2`,
          name: "Year-End Review",
          startDate: new Date(currentYear, 11, 1), // Dec 1
          endDate: new Date(currentYear, 11, 31), // Dec 31
          goalWindowId: defaultGoalWindowId
        }
      ];
    }

    onDataChange({ 
      frequency,
      reviewPeriods: defaultPeriods
    });
  };

  const handleDateChange = (date: Date | undefined) => {
    const startDate = date ? date.toISOString().split('T')[0] : '';
    onDataChange({ startDate });
  };

  return (
    <div className="space-y-6">
      {/* Cycle Name */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Cycle Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cycleName" className="text-base font-medium">
              Cycle Name *
            </Label>
            <Input
              id="cycleName"
              value={data.cycleName}
              onChange={(e) => onDataChange({ cycleName: e.target.value })}
              placeholder="e.g., 2024 Annual Performance Review"
              className={errors.cycleName ? "border-destructive" : ""}
            />
            {errors.cycleName && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.cycleName[0]}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Give your appraisal cycle a descriptive name
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Frequency Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Review Frequency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={data.frequency}
            onValueChange={handleFrequencyChange}
            className="space-y-4"
          >
            <div 
              className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleFrequencyChange("annual")}
            >
              <RadioGroupItem value="annual" id="annual" />
              <div className="flex-1">
                <Label htmlFor="annual" className="font-medium cursor-pointer">Annual Review</Label>
                <p className="text-sm text-muted-foreground">
                  One comprehensive review per year
                </p>
              </div>
            </div>
            <div 
              className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleFrequencyChange("bi-annual")}
            >
              <RadioGroupItem value="bi-annual" id="bi-annual" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="bi-annual" className="font-medium cursor-pointer">Bi-Annual Review</Label>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    Recommended
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Two reviews per year (mid-year and year-end)
                </p>
              </div>
            </div>
          </RadioGroup>
          {errors.frequency && (
            <p className="text-sm text-destructive mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.frequency[0]}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Start Date */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Cycle Start Date
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">
              Review Cycle Start Date *
            </Label>
            <div className="mt-2">
              <DatePicker
                date={data.startDate ? new Date(data.startDate) : undefined}
                onDateChange={handleDateChange}
                placeholder="Select start date"
                className={errors.startDate ? "border-destructive" : ""}
              />
            </div>
            {errors.startDate && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.startDate[0]}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              This will be the start date for your {data.frequency} review cycle
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};