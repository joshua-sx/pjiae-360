import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { DayPicker, type DayPickerSingleProps } from "react-day-picker";

interface AppraisalPeriod {
  name: string;
  startDate: Date;
  endDate: Date;
  color: string;
}

interface AppraisalCalendarProps extends Omit<DayPickerSingleProps, 'mode'> {
  highlightPeriod?: AppraisalPeriod;
  mode?: "single";
}

export function AppraisalCalendar({ 
  highlightPeriod, 
  className,
  ...props 
}: AppraisalCalendarProps) {
  
  // Function to check if a date is within the highlighted period
  const isInPeriod = (date: Date): boolean => {
    if (!highlightPeriod) return false;
    
    const dateTime = date.getTime();
    const startTime = highlightPeriod.startDate.getTime();
    const endTime = highlightPeriod.endDate.getTime();
    
    return dateTime >= startTime && dateTime <= endTime;
  };

  // Function to get custom day styles
  const getDayClassName = (date: Date): string => {
    if (!isInPeriod(date)) return "";
    
    const isStart = date.getTime() === highlightPeriod?.startDate.getTime();
    const isEnd = date.getTime() === highlightPeriod?.endDate.getTime();
    const isMiddle = !isStart && !isEnd;
    
    let classes = highlightPeriod?.color || "";
    
    if (isStart && isEnd) {
      // Single day period
      classes += " rounded-md border-2";
    } else if (isStart) {
      // Start of period
      classes += " rounded-l-md border-2 border-r";
    } else if (isEnd) {
      // End of period  
      classes += " rounded-r-md border-2 border-l";
    } else if (isMiddle) {
      // Middle of period
      classes += " border-t-2 border-b-2";
    }
    
    return classes;
  };

  return (
    <div className="flex justify-center">
      <DayPicker
        mode="single"
        className={cn("p-3 pointer-events-auto", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-border rounded-md hover:bg-accent"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
          day: cn(
            "h-9 w-9 p-0 font-normal rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
            "aria-selected:opacity-100"
          ),
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground font-semibold",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          day_hidden: "invisible",
        }}
        modifiers={{
          period: (date) => isInPeriod(date),
          periodStart: (date) => highlightPeriod ? date.getTime() === highlightPeriod.startDate.getTime() : false,
          periodEnd: (date) => highlightPeriod ? date.getTime() === highlightPeriod.endDate.getTime() : false,
          periodMiddle: (date) => {
            if (!highlightPeriod) return false;
            const isInRange = isInPeriod(date);
            const isStart = date.getTime() === highlightPeriod.startDate.getTime();
            const isEnd = date.getTime() === highlightPeriod.endDate.getTime();
            return isInRange && !isStart && !isEnd;
          }
        }}
        modifiersClassNames={{
          period: highlightPeriod?.color || "",
          periodStart: "rounded-l-md border-2 border-r",
          periodEnd: "rounded-r-md border-2 border-l", 
          periodMiddle: "border-t-2 border-b-2"
        }}
        {...props}
      />
    </div>
  );
}