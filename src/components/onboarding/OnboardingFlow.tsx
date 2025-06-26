
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import WelcomeIdentity from "./WelcomeIdentity";
import AddYourPeople from "./AddYourPeople";
import StructureOrg from "./StructureOrg";
import AssignRoles from "./AssignRoles";
import SuccessDashboard from "./SuccessDashboard";

export interface OnboardingData {
  organizationName: string;
  logo?: File;
  employees: Array<{
    id: string;
    name: string;
    email: string;
    department?: string;
    role: 'Director' | 'Manager' | 'Supervisor' | 'Employee';
  }>;
  divisions: Array<{
    id: string;
    name: string;
    departments: Array<{
      id: string;
      name: string;
    }>;
  }>;
  reviewCycle: {
    name: string;
    type: string;
    startDate: string;
    endDate: string;
    editableFrom?: string;
  };
}

const OnboardingFlow = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [currentMilestone, setCurrentMilestone] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    organizationName: "",
    employees: [],
    divisions: [],
    reviewCycle: {
      name: "Mid-Year 2025",
      type: "Mid-Year",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }
  });

  const updateData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  const nextMilestone = () => {
    if (currentMilestone < 4) {
      setCurrentMilestone(prev => prev + 1);
    } else {
      // Complete onboarding and go to dashboard
      navigate("/dashboard");
    }
  };

  const milestones = [
    <WelcomeIdentity key="welcome" data={onboardingData} updateData={updateData} onNext={nextMilestone} />,
    <AddYourPeople key="people" data={onboardingData} updateData={updateData} onNext={nextMilestone} />,
    <StructureOrg key="structure" data={onboardingData} updateData={updateData} onNext={nextMilestone} />,
    <AssignRoles key="roles" data={onboardingData} updateData={updateData} onNext={nextMilestone} />,
    <SuccessDashboard key="success" data={onboardingData} onNext={nextMilestone} />
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-slate-200">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${((currentMilestone + 1) / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SG</span>
          </div>
          <span className="text-xl font-semibold text-slate-800">Smartgoals 360</span>
        </div>
      </header>

      {/* Current milestone */}
      <div className="pt-20">
        {milestones[currentMilestone]}
      </div>
    </div>
  );
};

export default OnboardingFlow;
