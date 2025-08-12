import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  dateRange?: DateRange
  onDateRangeChange: (dateRange: DateRange | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DateRangePicker({ 
  dateRange, 
  onDateRangeChange, 
  placeholder = "Pick a date range",
  className,
  disabled = false
}: DateRangePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !dateRange && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} -{" "}
                {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={onDateRangeChange}
          numberOfMonths={2}
          initialFocus
          className="p-3 pointer-events-auto"
        />
        <div className="p-3 border-t flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDateRangeChange({ 
              from: new Date(), 
              to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
            })}
            className="flex-1"
          >
            Next 7 Days
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDateRangeChange(undefined)}
            className="flex-1"
          >
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}