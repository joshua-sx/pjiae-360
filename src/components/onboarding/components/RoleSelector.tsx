import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCog, Crown, Shield, User } from "lucide-react";

interface RoleSelectorProps {
  selectedRole: 'Director' | 'Manager' | 'Supervisor' | 'Employee';
  onRoleSelect: (role: 'Director' | 'Manager' | 'Supervisor' | 'Employee') => void;
  getRoleCount: (role: string) => number;
}

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

export default function RoleSelector({ selectedRole, onRoleSelect, getRoleCount }: RoleSelectorProps) {
  return (
    <Card className="w-full">
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
              className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedRole === role.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => onRoleSelect(role.name as any)}
            >
              <div className="flex items-center justify-between mb-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium truncate">{role.name}</span>
                </div>
                <Badge variant="outline" className={`${role.color} flex-shrink-0 ml-2`}>
                  {getRoleCount(role.name)}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{role.description}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}