import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Building2, 
  Users, 
  ChevronDown, 
  ChevronRight, 
  Search,
  Crown,
  AlertCircle,
  UserPlus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Employee {
  id: string;
  name: string;
  email: string;
  role?: string;
  department_id?: string;
  division_id?: string;
  avatar_url?: string;
  position_status?: string;
}

interface Department {
  id: string;
  name: string;
  division_id: string;
  employees: Employee[];
}

interface Division {
  id: string;
  name: string;
  departments: Department[];
  directReports: Employee[];
}

interface OrganizationalChartProps {
  onEmployeeSelect?: (employee: Employee) => void;
  showActions?: boolean;
  onAssignAppraiser?: (employee: Employee) => void;
}

export default function OrganizationalChart({ 
  onEmployeeSelect,
  showActions = false,
  onAssignAppraiser
}: OrganizationalChartProps) {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [ceoInfo, setCeoInfo] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDivisions, setExpandedDivisions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrganizationalData();
  }, []);

  const loadOrganizationalData = async () => {
    setLoading(true);
    try {
      // Load divisions
      const { data: divisionsData, error: divisionsError } = await supabase
        .from('divisions')
        .select('id, name, code')
        .order('name');

      if (divisionsError) throw divisionsError;

      // Load departments
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departments')
        .select('id, name, code, division_id')
        .order('name');

      if (departmentsError) throw departmentsError;

      // Load employees with their roles
      const { data: employeesData, error: employeesError } = await supabase
        .from('employee_info')
        .select(`
          id,
          name,
          email,
          department_id,
          division_id,
          avatar_url,
          roles(name)
        `)
        .eq('status', 'active')
        .order('name');

      if (employeesError) throw employeesError;

      // Find CEO (look for CEO role or executive division with specific titles)
      const ceo = employeesData?.find(emp => 
        emp.roles?.name?.toLowerCase().includes('ceo') ||
        emp.roles?.name?.toLowerCase().includes('chief executive')
      );
      setCeoInfo(ceo ? {
        id: ceo.id,
        name: ceo.name || ceo.email,
        email: ceo.email,
        role: ceo.roles?.name,
        avatar_url: ceo.avatar_url
      } : null);

      // Organize data into hierarchy
      const organizedDivisions = (divisionsData || []).map(division => {
        const divisionDepartments = (departmentsData || [])
          .filter(dept => dept.division_id === division.id)
          .map(dept => ({
            id: dept.id,
            name: dept.name,
            division_id: dept.division_id,
            employees: (employeesData || [])
              .filter(emp => emp.department_id === dept.id)
              .map(emp => ({
                id: emp.id,
                name: emp.name || emp.email,
                email: emp.email,
                role: emp.roles?.name,
                department_id: emp.department_id,
                division_id: emp.division_id,
                avatar_url: emp.avatar_url
              }))
          }));

        // Get direct division reports (no department assigned)
        const directReports = (employeesData || [])
          .filter(emp => emp.division_id === division.id && !emp.department_id)
          .map(emp => ({
            id: emp.id,
            name: emp.name || emp.email,
            email: emp.email,
            role: emp.roles?.name,
            division_id: emp.division_id,
            avatar_url: emp.avatar_url
          }));

        return {
          id: division.id,
          name: division.name,
          departments: divisionDepartments,
          directReports
        };
      });

      setDivisions(organizedDivisions);
      
      // Auto-expand Executive division
      setExpandedDivisions(new Set(['executive']));
    } catch (error) {
      console.error('Error loading organizational data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDivision = (divisionId: string) => {
    setExpandedDivisions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(divisionId)) {
        newSet.delete(divisionId);
      } else {
        newSet.add(divisionId);
      }
      return newSet;
    });
  };

  const filteredDivisions = divisions.map(division => {
    if (!searchQuery) return division;
    
    const filteredDepartments = division.departments.map(dept => ({
      ...dept,
      employees: dept.employees.filter(emp => 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(dept => dept.employees.length > 0);

    const filteredDirectReports = division.directReports.filter(emp =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
      ...division,
      departments: filteredDepartments,
      directReports: filteredDirectReports
    };
  }).filter(division => 
    division.departments.length > 0 || 
    division.directReports.length > 0 ||
    division.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const EmployeeCard = ({ employee, showDepartment = false }: { employee: Employee; showDepartment?: boolean }) => (
    <Card 
      className={`${onEmployeeSelect ? 'cursor-pointer hover:bg-muted/50' : ''} transition-colors`}
      onClick={() => onEmployeeSelect?.(employee)}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={employee.avatar_url} />
              <AvatarFallback className="text-xs">
                {employee.name?.split(' ').map(n => n[0]).join('') || 'E'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{employee.name}</p>
              </div>
              <p className="text-xs text-muted-foreground">{employee.role}</p>
              {showDepartment && (
                <p className="text-xs text-muted-foreground">{employee.email}</p>
              )}
            </div>
          </div>
          {showActions && onAssignAppraiser && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onAssignAppraiser(employee);
              }}
            >
              <UserPlus className="w-3 h-3 mr-1" />
              Assign
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading organizational chart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search employees, roles, or departments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {/* CEO Section */}
          {ceoInfo && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Crown className="w-5 h-5 text-yellow-600" />
                  Chief Executive Officer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EmployeeCard employee={ceoInfo} />
              </CardContent>
            </Card>
          )}

          {/* Divisions */}
          {filteredDivisions.map((division) => {
            const isExpanded = expandedDivisions.has(division.id);
            const totalEmployees = division.departments.reduce((acc, dept) => acc + dept.employees.length, 0) + division.directReports.length;

            return (
              <Card key={division.id}>
                <Collapsible open={isExpanded} onOpenChange={() => toggleDivision(division.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-primary" />
                          <div>
                            <CardTitle className="text-lg">{division.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {totalEmployees} employee{totalEmployees !== 1 ? 's' : ''} • {division.departments.length} department{division.departments.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Direct Division Reports */}
                        {division.directReports.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                              <Users className="w-4 h-4" />
                              Division Leadership
                            </div>
                            <div className="grid gap-2 ml-6">
                              {division.directReports.map((employee) => (
                                <EmployeeCard key={employee.id} employee={employee} />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Departments */}
                        {division.departments.map((department) => (
                          <div key={department.id} className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                              <Users className="w-4 h-4" />
                              {department.name} ({department.employees.length} employee{department.employees.length !== 1 ? 's' : ''})
                            </div>
                            {department.employees.length > 0 ? (
                              <div className="grid gap-2 ml-6">
                                {department.employees.map((employee) => (
                                  <EmployeeCard key={employee.id} employee={employee} />
                                ))}
                              </div>
                            ) : (
                              <div className="ml-6 p-4 border-2 border-dashed border-muted rounded-lg text-center">
                                <AlertCircle className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">No employees assigned</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}

          {filteredDivisions.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No results found</p>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}