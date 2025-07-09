import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import { Calendar, Clock, Eye, AlertCircle } from "lucide-react";
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
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="annual" id="annual" />
              <div className="flex-1">
                <Label htmlFor="annual" className="font-medium">Annual Review</Label>
                <p className="text-sm text-muted-foreground">
                  One comprehensive review per year
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="bi-annual" id="bi-annual" />
              <div className="flex-1">
                <Label htmlFor="bi-annual" className="font-medium">Bi-Annual Review</Label>
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

      {/* Visibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Review Visibility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium">
                Employee Visibility
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow employees to see their review status and feedback
              </p>
            </div>
            <Switch 
              checked={data.visibility} 
              onCheckedChange={(visibility) => onDataChange({ visibility })} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};