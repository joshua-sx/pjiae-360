import { PageHeader } from "@/components/ui/page-header";
import { AppraisalEventCalendar } from "@/components/calendar/AppraisalEventCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { DashboardLayout } from "@/components/DashboardLayout";

const EmployeeCalendarPage = () => {
  const { isDemoMode, demoRole } = useDemoMode();

  // Mock data for employee view - personal events only
  const upcomingEvents = [
    { title: "Mid-Year Review", date: "2024-06-15", type: "appraisal" },
    { title: "Goal Check-in", date: "2024-04-10", type: "goal" },
    { title: "Performance Discussion", date: "2024-05-20", type: "meeting" }
  ];

  const overdueTasks = [
    { title: "Complete Self-Assessment", dueDate: "2024-03-25" },
    { title: "Update Q1 Goals Progress", dueDate: "2024-03-30" }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
      <PageHeader
        title="My Calendar"
        description="View your review dates, meetings, and deadlines"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Scheduled events
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              This quarter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Component */}
      <Card>
        <CardHeader>
          <CardTitle>Your Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <AppraisalEventCalendar appraisalPeriods={{}} />
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      {overdueTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Overdue Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueTasks.map((task, index) => (
                <div key={index} className="flex justify-between items-center p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                  <span className="font-medium">{task.title}</span>
                  <span className="text-sm text-muted-foreground">Due: {task.dueDate}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </DashboardLayout>
  );
};

export default EmployeeCalendarPage;