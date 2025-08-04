
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  UserCog, 
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Eye,
  Settings
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import OrganizationalChart from "../onboarding/components/OrganizationalChart";
import AppraiserAssignmentModal from "../onboarding/components/AppraiserAssignmentModal";
import { useOrganizationStore, selectOrganizationName } from "@/stores";
import { useOrgMetrics } from "@/hooks/useOrgMetrics";
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";

interface Employee {
  id: string;
  name: string;
  email: string;
  role?: string;
  department?: string;
  division?: string;
  avatar_url?: string;
}

export default function AdminOrgManagement() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAppraiserModal, setShowAppraiserModal] = useState(false);
    const organizationName = useOrganizationStore(selectOrganizationName);
  const { data: orgMetrics, isLoading } = useOrgMetrics();

  const handleAssignAppraiser = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowAppraiserModal(true);
  };

  const stats = [
    {
      title: "Total Employees",
      value: isLoading ? "..." : orgMetrics?.totalEmployees?.toString() || "247",
      change: orgMetrics?.totalEmployeesChange || "+12",
      changeType: orgMetrics?.totalEmployeesChangeType || "positive" as const,
      icon: Users,
      description: "from last month"
    },
    {
      title: "Vacant Positions",
      value: isLoading ? "..." : orgMetrics?.vacantPositions?.toString() || "8",
      change: orgMetrics?.vacantPositionsChange || "-3",
      changeType: orgMetrics?.vacantPositionsChangeType || "positive" as const,
      icon: AlertTriangle,
      description: "from last month",
      iconColor: "text-yellow-600"
    },
    {
      title: "Pending Appraisals",
      value: isLoading ? "..." : orgMetrics?.pendingAppraisals?.toString() || "23",
      change: orgMetrics?.pendingAppraisalsChange || "+5",
      changeType: orgMetrics?.pendingAppraisalsChangeType || "negative" as const,
      icon: BarChart3,
      description: "from last month",
      iconColor: "text-blue-600"
    },
    {
      title: "Coverage Rate",
      value: isLoading ? "..." : orgMetrics?.coverageRate || "94%",
      change: orgMetrics?.coverageRateChange || "+2%",
      changeType: orgMetrics?.coverageRateChangeType || "positive" as const,
      icon: TrendingUp,
      description: "from last month",
      iconColor: "text-green-600"
    }
  ];

  return (
    <div className="space-y-6">
      <DemoModeBanner />
      
      <PageHeader
        title="Organization Management"
        description={`Manage ${organizationName || 'your organization'}'s organizational structure, roles, and reporting relationships`}
      >
        <Button>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <Tabs defaultValue="org-chart" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="org-chart" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Org Chart
          </TabsTrigger>
          <TabsTrigger value="appraisers" className="flex items-center gap-2">
            <UserCog className="w-4 h-4" />
            Appraisers
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="org-chart" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {organizationName || 'Organization'} Organizational Structure
              </CardTitle>
              <CardDescription>
                Interactive view of the airport's complete organizational hierarchy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrganizationalChart 
                onEmployeeSelect={setSelectedEmployee}
                showActions={true}
                onAssignAppraiser={handleAssignAppraiser}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appraisers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="w-5 h-5" />
                Appraiser Assignments
              </CardTitle>
              <CardDescription>
                Manage performance review assignments across the organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Pending Assignments</p>
                          <p className="text-2xl font-bold text-yellow-900">12</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">Completed</p>
                          <p className="text-2xl font-bold text-green-900">235</p>
                        </div>
                        <Users className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-800">Auto-Assigned</p>
                          <p className="text-2xl font-bold text-blue-900">198</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="rounded-lg border p-6 text-center">
                  <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Use Organizational Chart</h3>
                  <p className="text-muted-foreground mb-4">
                    Switch to the "Org Chart" tab to view and manage appraiser assignments for specific employees
                  </p>
                  <Button onClick={() => {
                    // Switch to org chart tab
                    const orgChartTab = document.querySelector('[value="org-chart"]') as HTMLElement;
                    orgChartTab?.click();
                  }}>
                    View Org Chart
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Organizational Health Reports
              </CardTitle>
              <CardDescription>
                Analytics and insights into organizational structure and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Division Coverage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: 'Executive', coverage: 100, employees: 5 },
                        { name: 'Technical', coverage: 95, employees: 23 },
                        { name: 'Finance', coverage: 98, employees: 18 },
                        { name: 'Operations', coverage: 92, employees: 67 },
                        { name: 'Human Resources', coverage: 100, employees: 12 },
                        { name: 'Engineering', coverage: 88, employees: 34 },
                        { name: 'Commercial', coverage: 94, employees: 28 },
                        { name: 'Security', coverage: 96, employees: 45 },
                        { name: 'Quality Assurance', coverage: 100, employees: 8 }
                      ].map((division) => (
                        <div key={division.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-sm">{division.name}</span>
                            <Badge variant={division.coverage >= 95 ? "default" : "secondary"}>
                              {division.coverage}%
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {division.employees} employees
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { action: 'New employee assigned', department: 'IT Services', time: '2 hours ago' },
                        { action: 'Appraiser updated', department: 'Finance', time: '4 hours ago' },
                        { action: 'Position marked vacant', department: 'Engineering', time: '1 day ago' },
                        { action: 'Department head changed', department: 'Commercial', time: '2 days ago' },
                        { action: 'New division created', department: 'Quality Assurance', time: '1 week ago' }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-muted last:border-0">
                          <div>
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-xs text-muted-foreground">{activity.department}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Organization Settings
              </CardTitle>
              <CardDescription>
                Configure organizational structure and management rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Hierarchy Rules</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Maximum Reporting Levels</label>
                        <p className="text-xs text-muted-foreground">Current: 4 levels (CEO → Division → Department → Employee)</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Auto-Assignment Rules</label>
                        <p className="text-xs text-muted-foreground">Automatically assign appraisers based on hierarchy</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Assignment Changes</label>
                        <p className="text-xs text-muted-foreground">Notify when appraiser assignments change</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Vacant Positions</label>
                        <p className="text-xs text-muted-foreground">Alert when positions become vacant</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AppraiserAssignmentModal
        open={showAppraiserModal}
        onOpenChange={setShowAppraiserModal}
        employee={selectedEmployee}
        onAssignmentComplete={() => {
          // Refresh data or show success message
          setShowAppraiserModal(false);
        }}
      />
    </div>
  );
}
