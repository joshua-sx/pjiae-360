
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Settings, Plus, Edit2, Trash2 } from "lucide-react";

const AppraisalCyclesPage = () => {
  // Mock data for appraisal cycles
  const cycles = [
    {
      id: 1,
      name: "2024 Annual Performance Review",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      status: "active",
      participants: 156,
      completedAppraisals: 89,
      pendingAppraisals: 67
    },
    {
      id: 2,
      name: "Q3 2024 Mid-Year Review",
      startDate: "2024-07-01",
      endDate: "2024-09-30",
      status: "completed",
      participants: 142,
      completedAppraisals: 142,
      pendingAppraisals: 0
    },
    {
      id: 3,
      name: "2025 Goal Setting Cycle",
      startDate: "2025-01-01",
      endDate: "2025-02-28",
      status: "draft",
      participants: 0,
      completedAppraisals: 0,
      pendingAppraisals: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'draft':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appraisal Cycles</h1>
          <p className="text-muted-foreground">
            Manage performance review cycles and track progress across your organization
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Cycle
        </Button>
      </div>

      <div className="grid gap-6">
        {cycles.map((cycle) => (
          <Card key={cycle.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {cycle.name}
                    <Badge className={getStatusColor(cycle.status)}>
                      {cycle.status.charAt(0).toUpperCase() + cycle.status.slice(1)}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {cycle.participants} participants
                    </span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{cycle.completedAppraisals}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{cycle.pendingAppraisals}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {cycle.participants > 0 ? Math.round((cycle.completedAppraisals / cycle.participants) * 100) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cycles.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Appraisal Cycles</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first performance review cycle.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Cycle
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AppraisalCyclesPage;
