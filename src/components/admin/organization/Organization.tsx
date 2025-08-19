
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, MapPin } from "lucide-react";
import { useDivisions } from "@/hooks/useDivisions";
import { useDepartments } from "@/hooks/useDepartments";
import { EmptyOrgState } from "./EmptyOrgState";
import { OrgStructureTabs } from "./OrgStructureTabs";

const Organization = () => {
  const { divisions, loading: divisionsLoading } = useDivisions();
  const { departments, loading: departmentsLoading } = useDepartments();
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  const isLoading = divisionsLoading || departmentsLoading;
  const isEmpty = divisions.length === 0 && departments.length === 0;

  // Calculate unassigned departments (not linked to any division)
  const unassignedDepartments = React.useMemo(() => {
    return departments.filter(dept => !dept.division_id);
  }, [departments]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Organization Structure</h1>
        <p className="text-gray-600 mt-2">
          Manage your organization's divisions and departments
        </p>
      </div>

      {isEmpty && !showCreateForm ? (
        <EmptyOrgState onCreateManually={() => setShowCreateForm(true)} />
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Divisions</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{divisions.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{departments.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unassigned Departments</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unassignedDepartments.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Management Tabs */}
          <OrgStructureTabs />
        </>
      )}
    </div>
  );
};

export default Organization;
