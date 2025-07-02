
import { useState, useMemo } from "react";
import { OnboardingStepProps } from "./OnboardingTypes";
import RoleSelector from "./components/RoleSelector";
import EmployeeList from "./components/EmployeeList";
import StickyFooter from "./components/StickyFooter";

const AssignRoles = ({ data, onDataChange, onNext }: OnboardingStepProps) => {
  const [selectedRole, setSelectedRole] = useState<'Director' | 'Manager' | 'Supervisor' | 'Employee'>('Director');
  const [searchTerm, setSearchTerm] = useState("");
  const [assignments, setAssignments] = useState<{[key: string]: 'Director' | 'Manager' | 'Supervisor' | 'Employee'}>(() => {
    const initial: {[key: string]: 'Director' | 'Manager' | 'Supervisor' | 'Employee'} = {};
    data.people.forEach(person => {
      initial[person.id] = (person.role as any) || 'Employee';
    });
    return initial;
  });

  const filteredPeople = useMemo(() => {
    if (!searchTerm) return data.people;
    
    const term = searchTerm.toLowerCase();
    return data.people.filter(person => 
      person.name.toLowerCase().includes(term) ||
      person.email.toLowerCase().includes(term) ||
      (person.department && person.department.toLowerCase().includes(term))
    );
  }, [data.people, searchTerm]);

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
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 pb-24">
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
              <RoleSelector 
                selectedRole={selectedRole}
                onRoleSelect={setSelectedRole}
                getRoleCount={getRoleCount}
              />
            </div>

            {/* People List */}
            <div className="lg:col-span-2">
              <EmployeeList
                people={data.people}
                filteredPeople={filteredPeople}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                assignments={assignments}
                selectedRole={selectedRole}
                onAssignRole={assignRole}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <StickyFooter onNext={handleNext} />
    </div>
  );
};

export default AssignRoles;
