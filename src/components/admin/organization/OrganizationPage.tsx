
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Mail, Phone, Globe, Edit2 } from "lucide-react";
import { useOrganizationStore } from "@/stores/organizationStore";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DepartmentTab from "./DepartmentTab";
import DivisionTab from "./DivisionTab";

const OrganizationPage = () => {
  const { name: organizationName } = useOrganizationStore();
  const orgInitials = (organizationName || 'SG')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  // TODO: Load organization data from database
  const organizationData = {
    name: organizationName || "Smartgoals 360 Enterprise",
    logo: null,
    address: {
      street: "123 Business Avenue",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      country: "United States"
    },
    contact: {
      email: "admin@smartgoals360.com",
      phone: "+1 (555) 123-4567",
      website: "https://smartgoals360.com"
    },
    departments: [
      { id: 1, name: "Engineering", employeeCount: 45, manager: "Sarah Chen" },
      { id: 2, name: "Marketing", employeeCount: 12, manager: "Michael Rodriguez" },
      { id: 3, name: "Sales", employeeCount: 23, manager: "Emily Johnson" },
      { id: 4, name: "Human Resources", employeeCount: 8, manager: "David Kim" },
      { id: 5, name: "Finance", employeeCount: 15, manager: "Lisa Thompson" }
    ],
    stats: {
      totalEmployees: 103,
      totalDepartments: 5,
      activeProjects: 18,
      completionRate: 87
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization"
        description="Manage organizational structure, departments, and company information"
      />

      {/* Organization Overview */}
      <div className="grid gap-6 md:grid-cols-2">
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
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">{orgInitials}</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{organizationData.name}</h3>
                <p className="text-sm text-muted-foreground">Enterprise Organization</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{organizationData.address.street}, {organizationData.address.city}, {organizationData.address.state} {organizationData.address.zipCode}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{organizationData.contact.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{organizationData.contact.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>{organizationData.contact.website}</span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{organizationData.stats.totalEmployees}</div>
                <div className="text-sm text-muted-foreground">Total Employees</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{organizationData.stats.totalDepartments}</div>
                <div className="text-sm text-muted-foreground">Departments</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{organizationData.stats.activeProjects}</div>
                <div className="text-sm text-muted-foreground">Active Projects</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{organizationData.stats.completionRate}%</div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="divisions">Divisions</TabsTrigger>
            </TabsList>
            <TabsContent value="departments" className="mt-6">
              <DepartmentTab departments={organizationData.departments} />
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
