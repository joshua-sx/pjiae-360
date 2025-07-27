import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Calendar } from "lucide-react";

interface StartDateSelectionProps {
  startDate: string;
  frequency: "annual" | "bi-annual";
  onDateChange: (date: Date | undefined) => void;
}

export const StartDateSelection = ({ startDate, frequency, onDateChange }: StartDateSelectionProps) => {
  const handleDateChange = (date: Date | undefined) => {
    onDateChange(date);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-base font-medium flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Review Cycle Start Date
          </Label>
          <p className="text-sm text-muted-foreground">
            When should the first review cycle begin?
          </p>
        </div>
        
        <div className="space-y-2">
          <DatePicker
            date={startDate ? new Date(startDate) : undefined}
            onDateChange={handleDateChange}
            placeholder="Select start date"
          />
          <p className="text-sm text-muted-foreground">
            This will be the start date for your {frequency} review cycle.
          </p>
        </div>
      </div>
    </Card>
  );
};