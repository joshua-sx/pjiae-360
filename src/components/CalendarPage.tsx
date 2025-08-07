
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppraisalEventCalendar } from "@/components/calendar/AppraisalEventCalendar";
import { AppraisalDateRangePicker } from "@/components/calendar/AppraisalDateRangePicker";
import { type DateRange } from "react-day-picker";
import { PageHeader } from "@/components/ui/page-header";
import { useMobileResponsive } from "@/hooks/use-mobile-responsive";
import { AppLayout } from "@/components/layouts/AppLayout";

// Placeholder for appraisal periods - to be loaded from database
const APPRAISAL_PERIODS = {
  "goal-setting": {
    name: "Goal Setting",
    startDate: new Date(2025, 0, 1), // Jan 1, 2025
    endDate: new Date(2025, 1, 15), // Feb 15, 2025
    color: "bg-blue-500/20 border-blue-500/40"
  },
  "mid-year": {
    name: "Mid-Year Review",
    startDate: new Date(2025, 5, 1), // June 1, 2025
    endDate: new Date(2025, 5, 30), // June 30, 2025
    color: "bg-yellow-500/20 border-yellow-500/40"
  },
  "year-end": {
    name: "Year-End Review",
    startDate: new Date(2025, 10, 1), // Nov 1, 2025
    endDate: new Date(2025, 11, 15), // Dec 15, 2025
    color: "bg-green-500/20 border-green-500/40"
  }
} as const;

type PeriodType = keyof typeof APPRAISAL_PERIODS;

export default function CalendarPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("goal-setting");
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const { isMobile } = useMobileResponsive();

  // Auto-select the date range when period changes
  const handlePeriodChange = (value: string) => {
    const periodType = value as PeriodType;
    setSelectedPeriod(periodType);
    
    // Auto-select the date range for the selected period
    const period = APPRAISAL_PERIODS[periodType];
    setSelectedRange({
      from: period.startDate,
      to: period.endDate
    });
  };

  // Initialize with the default period's date range
  React.useEffect(() => {
    if (!selectedRange) {
      const period = APPRAISAL_PERIODS[selectedPeriod];
      setSelectedRange({
        from: period.startDate,
        to: period.endDate
      });
    }
  }, [selectedPeriod, selectedRange]);

  return (
    <AppLayout>
      <PageHeader
        title="Calendar"
        description="View appraisal periods and important dates throughout the year"
      />

      {/* Date Range Picker */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <AppraisalDateRangePicker
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
            label="Filter by date range"
            placeholder="Select date range to filter events"
            className="max-w-md"
          />
        </CardContent>
      </Card>

      <Tabs 
        value={selectedPeriod} 
        onValueChange={handlePeriodChange}
        className="space-y-6"
      >
        <TabsList className={`grid w-full grid-cols-3 ${isMobile ? 'h-auto' : ''}`}>
          <TabsTrigger value="goal-setting" className={isMobile ? 'text-xs p-2' : ''}>
            {isMobile ? 'Goals' : 'Goal Setting'}
          </TabsTrigger>
          <TabsTrigger value="mid-year" className={isMobile ? 'text-xs p-2' : ''}>
            {isMobile ? 'Mid-Year' : 'Mid-Year Review'}
          </TabsTrigger>
          <TabsTrigger value="year-end" className={isMobile ? 'text-xs p-2' : ''}>
            {isMobile ? 'Year-End' : 'Year-End Review'}
          </TabsTrigger>
        </TabsList>

        {Object.entries(APPRAISAL_PERIODS).map(([key, period]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{period.name}</span>
                  <div className="text-sm font-normal text-muted-foreground">
                    {period.startDate.toLocaleDateString()} - {period.endDate.toLocaleDateString()}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AppraisalEventCalendar
                  appraisalPeriods={APPRAISAL_PERIODS}
                  selectedPeriod={key}
                  selectedRange={selectedRange}
                  highlightRange={selectedRange}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </AppLayout>
  );
}
