
import { useId, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AppraisalDateRangePickerProps {
  selectedRange?: DateRange;
  onRangeChange?: (range: DateRange | undefined) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function AppraisalDateRangePicker({
  selectedRange,
  onRangeChange,
  label = "Filter by date range",
  placeholder = "Pick a date range",
  className
}: AppraisalDateRangePickerProps) {
  const id = useId();

  return (
    <div className={className}>
      <div className="*:not-first:mt-2">
        <Label htmlFor={id}>{label}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id={id}
              variant="outline"
              className="group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
            >
              <span
                className={cn("truncate", !selectedRange && "text-muted-foreground")}
              >
                {selectedRange?.from ? (
                  selectedRange.to ? (
                    <>
                      {format(selectedRange.from, "LLL dd, y")} -{" "}
                      {format(selectedRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(selectedRange.from, "LLL dd, y")
                  )
                ) : (
                  placeholder
                )}
              </span>
              <CalendarIcon
                size={16}
                className="text-muted-foreground/80 group-hover:text-foreground shrink-0 transition-colors"
                aria-hidden="true"
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <Calendar 
              mode="range" 
              selected={selectedRange} 
              onSelect={onRangeChange}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
