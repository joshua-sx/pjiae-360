
import { useState, useMemo } from "react";
import { OnboardingStepProps } from "./OnboardingTypes";
import RoleSelector from "./components/RoleSelector";
import EmployeeList from "./components/EmployeeList";
import OnboardingStepLayout from "./components/OnboardingStepLayout";
import { supabase } from "@/integrations/supabase/client";

const AssignRoles = ({ data, onDataChange, onNext, onBack, isFinalStep = false }: OnboardingStepProps & { isFinalStep?: boolean }) => {
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
      `${person.firstName} ${person.lastName}`.toLowerCase().includes(term) ||
      person.email.toLowerCase().includes(term) ||
      person.department.toLowerCase().includes(term) ||
      person.division.toLowerCase().includes(term)
    );
  }, [data.people, searchTerm]);

  const assignRole = (personId: string, role: 'Director' | 'Manager' | 'Supervisor' | 'Employee') => {
    setAssignments(prev => ({
      ...prev,
      [personId]: role
    }));
  };

  const handleNext = async () => {
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

    // Persist role assignments for imported employees
    const roleAssignmentPromises = updatedPeople
      .filter(person => person.role !== 'Employee' && person.employeeInfoId)
      .map(async (person) => {
        try {
          // Map role to valid enum values
          const roleMap: Record<string, string> = {
            'Director': 'director',
            'Manager': 'manager', 
            'Supervisor': 'supervisor',
            'Employee': 'employee'
          };
          
          const { error } = await supabase.rpc('assign_user_role_secure', {
            _target_user_id: person.employeeInfoId,
            _role: (roleMap[person.role!] || 'employee') as 'admin' | 'director' | 'manager' | 'supervisor' | 'employee',
            _reason: 'Onboarding role assignment'
          });
          
          if (error) {
            console.error(`Failed to assign role ${person.role} to ${person.email}:`, error);
            return { success: false, email: person.email, error: error.message };
          }
          
          return { success: true, email: person.email };
        } catch (err) {
          console.error(`Error assigning role to ${person.email}:`, err);
          return { success: false, email: person.email, error: String(err) };
        }
      });

    if (roleAssignmentPromises.length > 0) {
      try {
        const results = await Promise.all(roleAssignmentPromises);
        const failedAssignments = results.filter(r => !r.success);
        
        if (failedAssignments.length > 0) {
          console.warn('Some role assignments failed:', failedAssignments);
          // Store failures but continue - they'll be retried in persistence hook
        }
      } catch (error) {
        console.error('Error during role assignment:', error);
      }
    }

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
    <OnboardingStepLayout
      onBack={onBack} 
      onNext={handleNext}
      isFinalStep={isFinalStep}
      maxWidth="6xl"
    >
      <div className="px-4 sm:px-6 md:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2 sm:mb-4">
            Assign roles to your team
          </h1>
          <p className="text-slate-600 text-base sm:text-lg">
            Define the reporting structure and responsibilities
          </p>
        </div>

        <div className="flex flex-col gap-6 w-full max-w-full overflow-x-hidden">
          {/* Role Selector - Horizontal layout */}
          <div className="w-full">
            <RoleSelector 
              selectedRole={selectedRole}
              onRoleSelect={setSelectedRole}
              getRoleCount={getRoleCount}
              layout="horizontal"
            />
          </div>

          {/* People List - Full width with scroll */}
          <div className="w-full">
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
    </OnboardingStepLayout>
  );
};

export default AssignRoles;
