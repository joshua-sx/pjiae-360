
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, AlertCircle, ArrowRight, Crown, UserCog, Shield, User } from "lucide-react";
import { OnboardingData } from "./OnboardingTypes";

interface ImportSummaryProps {
  data: OnboardingData;
  onDataChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkipTo?: (stepIndex: number) => void;
}

const ImportSummary = ({ data, onDataChange, onNext, onBack }: ImportSummaryProps) => {
  const [showRoleAssignment, setShowRoleAssignment] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'Director' | 'Manager' | 'Supervisor' | 'Employee'>('Director');
  const [assignments, setAssignments] = useState<{[key: string]: 'Director' | 'Manager' | 'Supervisor' | 'Employee'}>(() => {
    const initial: {[key: string]: 'Director' | 'Manager' | 'Supervisor' | 'Employee'} = {};
    data.people.forEach(person => {
      initial[person.id] = (person.role as any) || 'Employee';
    });
    return initial;
  });

  const { importStats } = data;

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

  const getRoleCount = (role: string) => {
    return Object.values(assignments).filter(r => r === role).length;
  };

  const handleAssignRoles = () => {
    setShowRoleAssignment(true);
  };

  const handleCompleteRoleAssignment = () => {
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

  const handleSkipRoles = () => {
    onNext();
  };

  if (showRoleAssignment) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1 px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Assign Roles to Your Team
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
                                <p className="font-medium text-slate-900">{`${person.firstName} ${person.lastName}`}</p>
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
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="border-t bg-white px-6 py-4 flex-shrink-0">
          <div className="max-w-6xl mx-auto flex gap-4">
            <Button onClick={() => setShowRoleAssignment(false)} variant="outline" className="flex-1">
              ← Back
            </Button>
            <Button onClick={handleCompleteRoleAssignment} className="flex-1">
              Continue →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 px-6 py-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Header */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Import Complete!
            </h1>
            <p className="text-xl text-slate-600">
              Your team members have been successfully imported
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-green-700">{importStats.successful}</p>
                <p className="text-sm text-green-600">Successfully imported</p>
              </CardContent>
            </Card>
            
            <Card className="border-slate-200">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-slate-700">{importStats.total}</p>
                <p className="text-sm text-slate-600">Total processed</p>
              </CardContent>
            </Card>

            {importStats.errors > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-orange-700">{importStats.errors}</p>
                  <p className="text-sm text-orange-600">Skipped (errors)</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Next Steps */}
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary">What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p className="text-slate-800">Assign roles to your team members</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p className="text-slate-800">Structure your organization</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <p className="text-slate-800">Set up review cycles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              onClick={handleAssignRoles}
              className="w-full h-14 text-lg font-semibold bg-black hover:bg-gray-800"
            >
              Assign Roles <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button
              onClick={handleSkipRoles}
              variant="outline"
              className="w-full h-12"
            >
              Skip Role Assignment for Now
            </Button>
          </div>

          {/* Tip */}
          <div className="mt-8 p-4 bg-slate-100 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-600">
              💡 <strong>Tip:</strong> You can always add more team members or modify roles later from your dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="border-t bg-white px-6 py-4 flex-shrink-0">
        <div className="max-w-2xl mx-auto flex gap-4">
          <Button onClick={onBack} variant="outline" className="flex-1">
            ← Back
          </Button>
          <Button onClick={handleSkipRoles} className="flex-1 bg-black hover:bg-gray-800">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImportSummary;
