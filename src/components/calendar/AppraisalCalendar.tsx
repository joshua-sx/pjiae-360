import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { type DateRange, type DayPickerRangeProps } from "react-day-picker";

interface AppraisalPeriod {
  name: string;
  startDate: Date;
  endDate: Date;
  color: string;
}

interface AppraisalCalendarProps extends Omit<DayPickerRangeProps, 'mode' | 'selected' | 'onSelect'> {
  selectedRange?: DateRange;
  onSelectRange?: (range: DateRange | undefined) => void;
  highlightPeriod?: AppraisalPeriod;
}

export function AppraisalCalendar({ 
  selectedRange,
  onSelectRange,
  highlightPeriod, 
  className,
  ...props 
}: AppraisalCalendarProps) {
  
  // Convert the highlight period to a DateRange for the calendar
  const periodRange: DateRange | undefined = highlightPeriod ? {
    from: highlightPeriod.startDate,
    to: highlightPeriod.endDate
  } : undefined;

  return (
    <Calendar
      mode="range"
      selected={periodRange}
      onSelect={onSelectRange}
      defaultMonth={periodRange?.from}
      numberOfMonths={2}
      className={cn("rounded-lg border shadow-sm", className)}
      {...props}
    />
  );
}