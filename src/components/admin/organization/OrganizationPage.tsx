
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Mail, Phone, Globe, Edit2 } from "lucide-react";
import { useOrganizationStore } from "@/stores/organizationStore";
import { useOrganization } from "@/hooks/useOrganization";
import { useEmployees } from "@/hooks/useEmployees";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import DepartmentTab from "./DepartmentTab";
import DivisionTab from "./DivisionTab";

const OrganizationPage = () => {
  const { name: organizationName } = useOrganizationStore();
  const { organization, loading: orgLoading } = useOrganization();
  const { data: employees } = useEmployees();
  
  const orgName = organization?.name || organizationName || "Smartgoals 360 Enterprise";
  const orgInitials = orgName
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  
  const totalEmployees = employees?.length || 0;
  
  if (orgLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Organization"
          description="Manage organizational structure, departments, and company information"
        />
        <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization"
        description="Manage organizational structure, departments, and company information"
      />

      {/* Organization Overview */}
      <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>
              Basic organization details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 xs:gap-4">
              <div className="h-12 w-12 xs:h-16 xs:w-16 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm xs:text-xl">{orgInitials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base xs:text-lg truncate">{orgName}</h3>
                <p className="text-xs xs:text-sm text-muted-foreground">Enterprise Organization</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-xs xs:text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="break-words">Organization Address</span>
              </div>
              <div className="flex items-center gap-2 text-xs xs:text-sm">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="break-all">Contact Email</span>
              </div>
              <div className="flex items-center gap-2 text-xs xs:text-sm">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>Contact Phone</span>
              </div>
              <div className="flex items-center gap-2 text-xs xs:text-sm">
                <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="break-all">Company Website</span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full h-11">
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Organization Details
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organization Statistics</CardTitle>
            <CardDescription>
              Key metrics and organizational overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 xs:gap-4">
              <div className="text-center p-3 xs:p-4 bg-muted/50 rounded-lg">
                <div className="text-lg xs:text-2xl font-bold text-primary">{totalEmployees}</div>
                <div className="text-xs xs:text-sm text-muted-foreground">Total Employees</div>
              </div>
              <div className="text-center p-3 xs:p-4 bg-muted/50 rounded-lg">
                <div className="text-lg xs:text-2xl font-bold text-blue-600">-</div>
                <div className="text-xs xs:text-sm text-muted-foreground">Departments</div>
              </div>
              <div className="text-center p-3 xs:p-4 bg-muted/50 rounded-lg">
                <div className="text-lg xs:text-2xl font-bold text-green-600">-</div>
                <div className="text-xs xs:text-sm text-muted-foreground">Active Projects</div>
              </div>
              <div className="text-center p-3 xs:p-4 bg-muted/50 rounded-lg">
                <div className="text-lg xs:text-2xl font-bold text-orange-600">-</div>
                <div className="text-xs xs:text-sm text-muted-foreground">Completion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organization Structure Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Organizational Structure</CardTitle>
          <CardDescription>
            Manage departments and divisions within your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="departments" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-11">
              <TabsTrigger value="departments" className="text-xs xs:text-sm">Departments</TabsTrigger>
              <TabsTrigger value="divisions" className="text-xs xs:text-sm">Divisions</TabsTrigger>
            </TabsList>
            <TabsContent value="departments" className="mt-6">
              <DepartmentTab />
            </TabsContent>
            <TabsContent value="divisions" className="mt-6">
              <DivisionTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationPage;
