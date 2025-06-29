
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCog, Crown, Users, Shield, User } from "lucide-react";
import { OnboardingStepProps } from "./OnboardingTypes";

const AssignRoles = ({ data, onDataChange, onNext }: OnboardingStepProps) => {
  const [selectedRole, setSelectedRole] = useState<'Director' | 'Manager' | 'Supervisor' | 'Employee'>('Director');
  const [assignments, setAssignments] = useState<{[key: string]: 'Director' | 'Manager' | 'Supervisor' | 'Employee'}>(() => {
    const initial: {[key: string]: 'Director' | 'Manager' | 'Supervisor' | 'Employee'} = {};
    data.people.forEach(person => {
      initial[person.id] = (person.role as any) || 'Employee';
    });
    return initial;
  });

  const roles = [
    {
      name: 'Director',
      icon: Crown,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'Executive leadership, strategic decisions'
    },
    {
      name: 'Manager',
      icon: UserCog,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Team leadership, operational oversight'
    },
    {
      name: 'Supervisor',
      icon: Shield,
      color: 'bg-green-100 text-green-800 border-green-200',
      description: 'Direct supervision, task coordination'
    },
    {
      name: 'Employee',
      icon: User,
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      description: 'Individual contributor, task execution'
    }
  ] as const;

  const assignRole = (personId: string, role: 'Director' | 'Manager' | 'Supervisor' | 'Employee') => {
    setAssignments(prev => ({
      ...prev,
      [personId]: role
    }));
  };

  const handleNext = () => {
    // Update people with roles
    const updatedPeople = data.people.map(person => ({
      ...person,
      role: assignments[person.id] || 'Employee'
    }));

    // Group by roles
    const roles = {
      directors: [] as string[],
      managers: [] as string[],
      supervisors: [] as string[],
      employees: [] as string[]
    };

    updatedPeople.forEach(person => {
      switch (person.role) {
        case 'Director':
          roles.directors.push(person.id);
          break;
        case 'Manager':
          roles.managers.push(person.id);
          break;
        case 'Supervisor':
          roles.supervisors.push(person.id);
          break;
        default:
          roles.employees.push(person.id);
      }
    });

    onDataChange({
      people: updatedPeople,
      roles
    });
    onNext();
  };

  const getRoleCount = (role: string) => {
    return Object.values(assignments).filter(r => r === role).length;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Assign roles to your team
          </h1>
          <p className="text-slate-600 text-lg">
            Define the reporting structure and responsibilities
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Role Selector */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="w-5 h-5" />
                  Select Role
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <div
                      key={role.name}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedRole === role.name
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setSelectedRole(role.name as any)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span className="font-medium">{role.name}</span>
                        </div>
                        <Badge variant="outline" className={role.color}>
                          {getRoleCount(role.name)}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{role.description}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* People List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Members ({data.people.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {data.people.map((person) => {
                    const currentRole = assignments[person.id] || 'Employee';
                    const roleInfo = roles.find(r => r.name === currentRole);
                    const Icon = roleInfo?.icon || User;

                    return (
                      <div
                        key={person.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <Icon className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{person.name}</p>
                            <p className="text-sm text-slate-600">{person.email}</p>
                            {person.department && (
                              <p className="text-xs text-slate-500">{person.department}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={roleInfo?.color}>
                            {currentRole}
                          </Badge>
                          <Button
                            onClick={() => assignRole(person.id, selectedRole)}
                            variant="outline"
                            size="sm"
                          >
                            Assign {selectedRole}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {data.people.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No team members added yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button
            onClick={handleNext}
            className="h-14 px-8 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
          >
            Continue to Structure Organization →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignRoles;
