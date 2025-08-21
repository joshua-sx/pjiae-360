
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

export default function OrganizationPage() {
    const organizationName = useOrganizationStore(selectOrganizationName);
  const { organization, loading: orgLoading } = useOrganization();
  const { data: employees } = useEmployees({ limit: 1000 }); // Use high limit for accurate total count
  
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
        // ... keep existing cards content
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
};
