
import { Button } from "@/components/ui/button";
import { CheckCircle, Building2, Users, Crown, Calendar } from "lucide-react";
import { OnboardingData } from "./OnboardingTypes";

interface SuccessDashboardProps {
  data: OnboardingData;
  onNext: () => void;
  onBack: () => void;
}

const SuccessDashboard = ({ data, onNext, onBack }: SuccessDashboardProps) => {
  const totalDepartments = data.orgStructure.filter(item => item.type === 'department').length;
  const totalDivisions = data.orgStructure.filter(item => item.type === 'division').length;
  
  const roleCount = {
    Director: data.people.filter(emp => emp.role === 'Director').length,
    Manager: data.people.filter(emp => emp.role === 'Manager').length,
    Supervisor: data.people.filter(emp => emp.role === 'Supervisor').length,
    Employee: data.people.filter(emp => emp.role === 'Employee').length,
  };
  const totalAssignedRoles = roleCount.Director + roleCount.Manager + roleCount.Supervisor;

  const stats = [
    {
      icon: Users,
      value: data.people.length,
      label: "employees added",
      color: "text-primary bg-primary/10"
    },
    {
      icon: Building2,
      value: `${totalDivisions} divisions & ${totalDepartments} departments`,
      label: "created",
      color: "text-green-600 bg-green-50"
    },
    {
      icon: Crown,
      value: totalAssignedRoles,
      label: "leadership roles assigned",
      color: "text-purple-600 bg-purple-50"
    },
    {
      icon: Calendar,
      value: "1 review cycle",
      label: "created",
      color: "text-orange-600 bg-orange-50"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-8">
      <div className="max-w-md w-full text-center">
        <Button
          onClick={onNext}
          className="w-full h-14 text-lg font-semibold"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default SuccessDashboard;
