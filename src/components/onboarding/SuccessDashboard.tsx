
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
    <div className="h-screen bg-slate-50 overflow-hidden px-6 py-6">
      <div className="max-w-2xl w-full mx-auto">
        {/* Success Animation */}
        <div className="mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 animate-scale-in">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            You're ready to launch!
          </h1>
          <p className="text-lg text-slate-600">
            Your PJIAE 360 workspace is set up and ready to transform your team's performance reviews.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className="bg-white rounded-lg border border-slate-200 p-4 text-left animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-600">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Organization Summary */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6 text-left">
          <h3 className="font-semibold text-slate-900 mb-3">Your Organization Setup</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 text-sm">Organization:</span>
              <span className="font-medium text-slate-900 text-sm">{data.orgName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 text-sm">Review Cycle:</span>
              <span className="font-medium text-slate-900 text-sm">{data.reviewCycle.frequency}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 text-sm">Start Date:</span>
              <span className="font-medium text-slate-900 text-sm">
                {new Date(data.reviewCycle.startDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Single Action Button */}
        <Button
          onClick={onNext}
          className="w-full h-12 text-base font-semibold"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default SuccessDashboard;
