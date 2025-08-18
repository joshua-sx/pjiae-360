import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, AlertCircle } from "lucide-react";
import { CycleData } from "../types";
import { ValidationErrors } from "../validation";
import { ReviewPeriodItem } from "./review-periods/ReviewPeriodItem";
import { toast } from "sonner";

interface ReviewPeriodsStepProps {
  data: CycleData;
  onDataChange: (updates: Partial<CycleData>) => void;
  errors: ValidationErrors;
}

export const ReviewPeriodsStep = ({ data, onDataChange, errors }: ReviewPeriodsStepProps) => {
  const handleEditPeriod = (id: string, updatedPeriod: { name: string; startDate: Date; endDate: Date }) => {
    onDataChange({
      reviewPeriods: data.reviewPeriods.map(period => 
        period.id === id ? { ...period, ...updatedPeriod } : period
      )
    });
    toast.success("Review period updated");
  };

  const handleRemovePeriod = (id: string) => {
    onDataChange({
      reviewPeriods: data.reviewPeriods.filter(period => period.id !== id)
    });
    toast.success("Review period removed");
  };

  return (
    <div className="space-y-6">
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

      {/* Appraisal Review Periods */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            <CardTitle className="text-2xl font-semibold">Appraisal Review Periods</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Configure your review periods for mid-year and end-year evaluations.
          </p>

          <div className="divide-y">
            {data.reviewPeriods.map((period) => (
              <ReviewPeriodItem
                key={period.id}
                id={period.id}
                title={period.name}
                startDate={period.startDate}
                endDate={period.endDate}
                durationDays={Math.ceil((period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24))}
                onEdit={handleEditPeriod}
                onDelete={handleRemovePeriod}
              />
            ))}
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
};