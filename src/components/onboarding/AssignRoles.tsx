
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Crown, Shield, User, Users } from "lucide-react";
import { OnboardingData } from "./OnboardingFlow";

interface AssignRolesProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
}

type Role = 'Director' | 'Manager' | 'Supervisor' | 'Employee';

const AssignRoles = ({ data, updateData, onNext }: AssignRolesProps) => {
  const [employees, setEmployees] = useState(data.employees);
  const [reviewCycle, setReviewCycle] = useState(data.reviewCycle);
  const [draggedEmployee, setDraggedEmployee] = useState<string | null>(null);

  const roleConfigs = {
    Director: { icon: Crown, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    Manager: { icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    Supervisor: { icon: Users, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
    Employee: { icon: User, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' }
  };

  const handleDragStart = (employeeId: string) => {
    setDraggedEmployee(employeeId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newRole: Role) => {
    e.preventDefault();
    if (draggedEmployee) {
      setEmployees(employees.map(emp => 
        emp.id === draggedEmployee ? { ...emp, role: newRole } : emp
      ));
      setDraggedEmployee(null);
    }
  };

  const handleNext = () => {
    updateData({ 
      employees,
      reviewCycle
    });
    onNext();
  };

  const getRoleCount = (role: Role) => employees.filter(emp => emp.role === role).length;

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Who does what?
          </h1>
          <p className="text-slate-600 text-lg">
            Drag employees to assign roles and set up your review cycle
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Role Assignment */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Assign Roles</h2>
            
            {/* Role Buckets */}
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(roleConfigs) as Role[]).map((role) => {
                const config = roleConfigs[role];
                const Icon = config.icon;
                const roleEmployees = employees.filter(emp => emp.role === role);
                
                return (
                  <div
                    key={role}
                    className={`min-h-32 p-4 rounded-xl border-2 border-dashed ${config.bg} transition-colors ${
                      draggedEmployee ? 'border-solid' : ''
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, role)}
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <Icon className={`w-5 h-5 ${config.color}`} />
                      <span className="font-semibold text-slate-900">{role}</span>
                      <span className="text-sm text-slate-500">({roleEmployees.length})</span>
                    </div>
                    
                    <div className="space-y-2">
                      {roleEmployees.map((employee) => (
                        <EmployeeCard
                          key={employee.id}
                          employee={employee}
                          onDragStart={() => handleDragStart(employee.id)}
                          isDragging={draggedEmployee === employee.id}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Role Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {(Object.keys(roleConfigs) as Role[]).map((role) => (
                  <div key={role} className="flex justify-between">
                    <span className="text-slate-600">{role}s:</span>
                    <span className="font-medium">{getRoleCount(role)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Review Cycle Setup */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Review Cycle</h2>
            
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">Performance Review Setup</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="cycleName" className="text-sm font-medium text-slate-700">
                    Review Cycle Name
                  </Label>
                  <Input
                    id="cycleName"
                    value={reviewCycle.name}
                    onChange={(e) => setReviewCycle({...reviewCycle, name: e.target.value})}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="cycleType" className="text-sm font-medium text-slate-700">
                    Type
                  </Label>
                  <Input
                    id="cycleType"
                    value={reviewCycle.type}
                    onChange={(e) => setReviewCycle({...reviewCycle, type: e.target.value})}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="text-sm font-medium text-slate-700">
                      Start Date
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={reviewCycle.startDate}
                      onChange={(e) => setReviewCycle({...reviewCycle, startDate: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-sm font-medium text-slate-700">
                      End Date
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={reviewCycle.endDate}
                      onChange={(e) => setReviewCycle({...reviewCycle, endDate: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="editableFrom" className="text-sm font-medium text-slate-700">
                    Appraisers can edit from <span className="text-slate-500">(optional)</span>
                  </Label>
                  <Input
                    id="editableFrom"
                    type="date"
                    value={reviewCycle.editableFrom || ''}
                    onChange={(e) => setReviewCycle({...reviewCycle, editableFrom: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  💡 Your review cycle will automatically include all team members and can be customized later.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            onClick={handleNext}
            className="px-12 h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
          >
            Let's Go →
          </Button>
        </div>
      </div>
    </div>
  );
};

interface EmployeeCardProps {
  employee: {
    id: string;
    name: string;
    email: string;
    department?: string;
    role: Role;
  };
  onDragStart: () => void;
  isDragging: boolean;
}

const EmployeeCard = ({ employee, onDragStart, isDragging }: EmployeeCardProps) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`flex items-center space-x-3 p-2 bg-white rounded-lg border shadow-sm cursor-move transition-all ${
        isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md'
      }`}
    >
      <Avatar className="w-8 h-8">
        <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
          {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{employee.name}</p>
        <p className="text-xs text-slate-500 truncate">{employee.email}</p>
      </div>
    </div>
  );
};

export default AssignRoles;
