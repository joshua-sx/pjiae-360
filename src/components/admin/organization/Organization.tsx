
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, MapPin, Badge } from "lucide-react";
import { useDivisions } from "@/hooks/useDivisions";
import { useDepartments } from "@/hooks/useDepartments";

const Organization = () => {
  const { divisions, loading: divisionsLoading } = useDivisions();
  const { departments, loading: departmentsLoading } = useDepartments();

  // Create a map of division IDs to names for quick lookup
  const divisionMap = React.useMemo(() => {
    return divisions.reduce((map, division) => {
      map[division.id] = division.name;
      return map;
    }, {} as Record<string, string>);
  }, [divisions]);

  // Group departments by division
  const departmentsByDivision = React.useMemo(() => {
    const grouped: Record<string, typeof departments> = {};
    const unassigned: typeof departments = [];

    departments.forEach(dept => {
      if (dept.division_id && divisionMap[dept.division_id]) {
        const divisionName = divisionMap[dept.division_id];
        if (!grouped[divisionName]) {
          grouped[divisionName] = [];
        }
        grouped[divisionName].push(dept);
      } else {
        unassigned.push(dept);
      }
    });

    return { grouped, unassigned };
  }, [departments, divisionMap]);

  if (divisionsLoading || departmentsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
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
            <div className="text-2xl font-bold">{departmentsByDivision.unassigned.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Divisions and Departments */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Divisions & Departments</h2>
        
        {/* Divisions with their departments */}
        {Object.entries(departmentsByDivision.grouped).map(([divisionName, depts]) => (
          <Card key={divisionName}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                {divisionName} Division
              </CardTitle>
              <CardDescription>
                {depts.length} department{depts.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {depts.map(dept => (
                  <div
                    key={dept.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{dept.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Standalone divisions (no departments) */}
        {divisions.filter(div => !Object.values(departmentsByDivision.grouped).some(depts => 
          depts.some(dept => dept.division_id === div.id)
        )).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Standalone Divisions
              </CardTitle>
              <CardDescription>
                Divisions without departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {divisions
                  .filter(div => !Object.values(departmentsByDivision.grouped).some(depts => 
                    depts.some(dept => dept.division_id === div.id)
                  ))
                  .map(division => (
                    <div
                      key={division.id}
                      className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
                    >
                      <Building className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{division.name}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Unassigned departments */}
        {departmentsByDivision.unassigned.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-amber-500" />
                Unassigned Departments
              </CardTitle>
              <CardDescription>
                Departments not linked to any division
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departmentsByDivision.unassigned.map(dept => (
                  <div
                    key={dept.id}
                    className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg"
                  >
                    <Users className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">{dept.name}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Unassigned
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Organization;
