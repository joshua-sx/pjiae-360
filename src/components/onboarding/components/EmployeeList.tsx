import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, User, Search, UserCog, Crown, Shield } from "lucide-react";
import SearchInput from "./SearchInput";

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  division: string;
  employeeId?: number;
  role?: string;
}

interface EmployeeListProps {
  people: Person[];
  filteredPeople: Person[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  assignments: {[key: string]: 'Director' | 'Manager' | 'Supervisor' | 'Employee'};
  selectedRole: 'Director' | 'Manager' | 'Supervisor' | 'Employee';
  onAssignRole: (personId: string, role: 'Director' | 'Manager' | 'Supervisor' | 'Employee') => void;
}

const roles = [
  { name: 'Director', icon: Crown, color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { name: 'Manager', icon: UserCog, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { name: 'Supervisor', icon: Shield, color: 'bg-green-100 text-green-800 border-green-200' },
  { name: 'Employee', icon: User, color: 'bg-gray-100 text-gray-800 border-gray-200' }
] as const;

export default function EmployeeList({ 
  people, 
  filteredPeople, 
  searchTerm, 
  onSearchChange, 
  assignments, 
  selectedRole, 
  onAssignRole 
}: EmployeeListProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Team Members ({searchTerm ? `${filteredPeople.length} of ${people.length}` : people.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SearchInput searchTerm={searchTerm} onSearchChange={onSearchChange} />

        <div className="space-y-3 max-h-none sm:max-h-96 overflow-y-auto w-full max-w-full overflow-x-hidden">
          {filteredPeople.map((person) => {
            const currentRole = assignments[person.id] || 'Employee';
            const roleInfo = roles.find(r => r.name === currentRole);
            const Icon = roleInfo?.icon || User;

            return (
              <div
                key={person.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg hover:bg-slate-50"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate">{`${person.firstName} ${person.lastName}`}</p>
                    <p className="text-sm text-slate-600 break-words sm:truncate">{person.email}</p>
                    <p className="text-xs text-slate-500 break-words sm:truncate">{person.department} • {person.division}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 flex-shrink-0">
                  <Badge variant="outline" className={`${roleInfo?.color} sm:whitespace-nowrap`}>
                    {currentRole}
                  </Badge>
                  <Button
                    onClick={() => onAssignRole(person.id, selectedRole)}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto text-xs sm:text-sm whitespace-nowrap"
                  >
                    Assign {selectedRole}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPeople.length === 0 && searchTerm && (
          <div className="text-center py-8 text-slate-500">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No employees found for "{searchTerm}"</p>
          </div>
        )}

        {people.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No team members added yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}