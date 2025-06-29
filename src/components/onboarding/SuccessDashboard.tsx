import { Button } from "@/components/ui/button";
import { CheckCircle, Building2, Users, Crown, Calendar } from "lucide-react";
import { OnboardingData } from "./OnboardingTypes";

interface SuccessDashboardProps {
  data: OnboardingData;
  onNext: () => void;
}

const SuccessDashboard = ({ data, onNext }: SuccessDashboardProps) => {
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
      color: "text-blue-600 bg-blue-50"
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
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* Success Animation */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            You're ready to launch!
          </h1>
          <p className="text-xl text-slate-600">
            Your SmartGoals 360 workspace is set up and ready to transform your team's performance reviews.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className="bg-white rounded-xl border border-slate-200 p-6 text-left animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-600">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Organization Summary */}
        <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-slate-900 mb-4">Your Organization Setup</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Organization:</span>
              <span className="font-medium text-slate-900">{data.orgName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Review Cycle:</span>
              <span className="font-medium text-slate-900">{data.reviewCycle.frequency}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Start Date:</span>
              <span className="font-medium text-slate-900">
                {new Date(data.reviewCycle.startDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={onNext}
            className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
          >
            Go to Dashboard
          </Button>
          
          <Button
            variant="outline"
            className="w-full h-12 text-slate-600 hover:text-slate-800"
          >
            Invite More Users
          </Button>
        </div>

        {/* Celebration Message */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <p className="text-sm text-slate-700">
            🎉 <strong>Congratulations!</strong> You've successfully set up your digital appraisal platform. 
            Your team can now experience modern, streamlined performance reviews.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessDashboard;
