
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Mail, Phone, Globe, Edit2 } from "lucide-react";
import { useOrganizationStore, selectOrganizationName } from "@/stores";
import { useOrganization } from "@/hooks/useOrganization";
import { useEmployees } from "@/hooks/useEmployees";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import DepartmentTab from "./DepartmentTab";
import DivisionTab from "./DivisionTab";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StorageVerification } from "@/components/admin/storage/StorageVerification";

export default function OrganizationPage() {
  const organizationName = useOrganizationStore(selectOrganizationName);
  const { organization, loading: orgLoading } = useOrganization();
  const { data: employees } = useEmployees({ limit: 1000 });
  
  const orgName = organization?.name || organizationName || "PJIAE 360 Enterprise";
  const orgInitials = orgName
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  
  const totalEmployees = employees?.length || 0;
  
  if (orgLoading) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Organization"
          description="Manage organizational structure, departments, and company information"
        />
        <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Organization"
        description="Manage organizational structure, departments, and company information"
      />

      {/* Organization Overview */}
      <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Organization Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-primary">{orgInitials}</span>
              </div>
              <div>
                <div className="text-xl font-semibold">{orgName}</div>
                <div className="text-sm text-muted-foreground">{totalEmployees} employees</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Princess Juliana International Airport</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>info@pjiae.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>+1 (721) 546-7542</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>www.pjiae.com</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Organization Details
            </Button>
          </CardContent>
        </Card>

        {/* Storage Verification Card */}
        <StorageVerification />
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
    </DashboardLayout>
  );
}
