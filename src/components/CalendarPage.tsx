import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppraisalCalendar } from "@/components/calendar/AppraisalCalendar";

// Mock data for appraisal periods
const APPRAISAL_PERIODS = {
  "goal-setting": {
    name: "Goal Setting",
    startDate: new Date(2024, 0, 1), // Jan 1, 2024
    endDate: new Date(2024, 1, 15), // Feb 15, 2024
    color: "bg-blue-500/20 border-blue-500/40"
  },
  "mid-year": {
    name: "Mid-Year Review", 
    startDate: new Date(2024, 5, 1), // June 1, 2024
    endDate: new Date(2024, 5, 30), // June 30, 2024
    color: "bg-yellow-500/20 border-yellow-500/40"
  },
  "year-end": {
    name: "Year-End Review",
    startDate: new Date(2024, 10, 1), // Nov 1, 2024
    endDate: new Date(2024, 11, 15), // Dec 15, 2024
    color: "bg-green-500/20 border-green-500/40"
  }
} as const;

type PeriodType = keyof typeof APPRAISAL_PERIODS;

export default function CalendarPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("goal-setting");
  const [selectedDate, setSelectedDate] = useState<Date>();

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Calendar" }
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            View appraisal periods and important dates throughout the year.
          </p>
        </div>

        <Tabs 
          value={selectedPeriod} 
          onValueChange={(value) => setSelectedPeriod(value as PeriodType)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="goal-setting">Goal Setting</TabsTrigger>
            <TabsTrigger value="mid-year">Mid-Year Review</TabsTrigger>
            <TabsTrigger value="year-end">Year-End Review</TabsTrigger>
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
                  <AppraisalCalendar
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    highlightPeriod={period}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}