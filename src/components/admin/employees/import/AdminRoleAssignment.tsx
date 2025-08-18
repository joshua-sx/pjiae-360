import { useState, useMemo } from "react";
import { EmployeeData } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, ArrowLeft, ArrowRight } from "lucide-react";

interface AdminRoleAssignmentProps {
  employees: EmployeeData[];
  onEmployeesUpdate: (employees: EmployeeData[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const roles = [
  {
    name: 'Director' as const,
    icon: '👑',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Executive leadership and strategic oversight'
  },
  {
    name: 'Manager' as const,
    icon: '📊',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Team management and operational leadership'
  },
  {
    name: 'Supervisor' as const,
    icon: '👥',
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Direct supervision and team coordination'
  },
  {
    name: 'Employee' as const,
    icon: '👤',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Individual contributor and team member'
  }
];

export default function AdminRoleAssignment({ 
  employees, 
  onEmployeesUpdate, 
  onNext, 
  onBack 
}: AdminRoleAssignmentProps) {
  const [selectedRole, setSelectedRole] = useState<'Director' | 'Manager' | 'Supervisor' | 'Employee'>('Employee');
  const [searchTerm, setSearchTerm] = useState("");
  const [assignments, setAssignments] = useState<{[key: string]: 'Director' | 'Manager' | 'Supervisor' | 'Employee'}>(() => {
    const initial: {[key: string]: 'Director' | 'Manager' | 'Supervisor' | 'Employee'} = {};
    employees.forEach((person, index) => {
      const key = `${person.email}-${index}`;
      initial[key] = person.role || 'Employee';
    });
    return initial;
  });

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees;
    
    const term = searchTerm.toLowerCase();
    return employees.filter(person => 
      `${person.firstName} ${person.lastName}`.toLowerCase().includes(term) ||
      person.email.toLowerCase().includes(term) ||
      person.department.toLowerCase().includes(term) ||
      person.division.toLowerCase().includes(term)
    );
  }, [employees, searchTerm]);

  const assignRole = (personEmail: string, personIndex: number, role: 'Director' | 'Manager' | 'Supervisor' | 'Employee') => {
    const key = `${personEmail}-${personIndex}`;
    setAssignments(prev => ({
      ...prev,
      [key]: role
    }));
  };

  const handleNext = async () => {
    // Update employees with roles
    const updatedEmployees = employees.map((person, index) => {
      const key = `${person.email}-${index}`;
      return {
        ...person,
        role: assignments[key] || 'Employee'
      };
    });

    // For imported employees, ensure they get their roles assigned via the secure function
    // This will be handled by the import persistence logic
    onEmployeesUpdate(updatedEmployees);
    onNext();
  };

  const getRoleCount = (role: string) => {
    return Object.values(assignments).filter(r => r === role).length;
  };

  const getEmployeeKey = (employee: EmployeeData, index: number) => {
    return `${employee.email}-${index}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Assign roles to your team
        </h1>
        <p className="text-slate-600 text-base sm:text-lg">
          Define the reporting structure and responsibilities for {employees.length} employees
        </p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Role Selector */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Role
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {roles.map((role) => (
                <div
                  key={role.name}
                  onClick={() => setSelectedRole(role.name)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedRole === role.name
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{role.icon}</span>
                      <span className="font-medium">{role.name}</span>
                    </div>
                    <Badge variant="secondary" className={role.color}>
                      {getRoleCount(role.name)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Employee List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Team Members</span>
                <Badge variant="outline">
                  {filteredEmployees.length} of {employees.length}
                </Badge>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No employees match your search.' : 'No employees to assign roles.'}
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredEmployees.map((employee, displayIndex) => {
                    const actualIndex = employees.indexOf(employee);
                    const key = getEmployeeKey(employee, actualIndex);
                    const currentRole = assignments[key] || 'Employee';
                    const roleInfo = roles.find(r => r.name === currentRole);

                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {employee.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            {employee.department} • {employee.division}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={roleInfo?.color}>
                            {roleInfo?.icon} {currentRole}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => assignRole(employee.email, actualIndex, selectedRole)}
                            disabled={currentRole === selectedRole}
                          >
                            Assign {selectedRole}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Preview
        </Button>
        <Button onClick={handleNext}>
          Continue to Import
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}