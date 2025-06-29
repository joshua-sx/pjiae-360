
import { useState, useCallback, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Users, UserCog, Layers, Calendar, CheckCircle } from "lucide-react";
import MilestoneHeader, { Milestone } from "./MilestoneHeader";
import WelcomeIdentityMilestone from "./WelcomeIdentityMilestone";
import AddYourPeople from "./AddYourPeople";
import StructureOrg from "./StructureOrg";
import AssignRoles from "./AssignRoles";
import SuccessDashboard from "./SuccessDashboard";

export interface OnboardingData {
  orgName: string;
  logo: File | null;
  adminInfo: {
    name: string;
    email: string;
    role: string;
  };
  people: Array<{
    id: string;
    name: string;
    email: string;
    department?: string;
    role?: string;
  }>;
  orgStructure: Array<{
    id: string;
    name: string;
    type: 'division' | 'department' | 'custom';
    parent?: string;
    children?: string[];
    rank?: number;
    description?: string;
  }>;
  roles: {
    directors: string[];
    managers: string[];
    supervisors: string[];
    employees: string[];
  };
  reviewCycle: {
    frequency: 'quarterly' | 'biannual' | 'annual';
    startDate: string;
    visibility: boolean;
  };
}

const milestones: Milestone[] = [
  {
    id: 'welcome',
    title: 'Welcome & Identity',
    icon: Building2,
    description: 'Set up your organization profile'
  },
  {
    id: 'people',
    title: 'Add Your People',
    icon: Users,
    description: 'Import your team members'
  },
  {
    id: 'structure',
    title: 'Structure Your Org',
    icon: Layers,
    description: 'Define departments and divisions'
  },
  {
    id: 'roles',
    title: 'Assign Roles',
    icon: UserCog,
    description: 'Set roles for your team'
  },
  {
    id: 'success',
    title: 'Success Dashboard',
    icon: CheckCircle,
    description: 'Your setup is complete!'
  }
];

const OnboardingFlow = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    orgName: "",
    logo: null,
    adminInfo: {
      name: user?.fullName || "Admin User",
      email: user?.primaryEmailAddress?.emailAddress || "admin@company.com",
      role: "Administrator"
    },
    people: [],
    orgStructure: [],
    roles: {
      directors: [],
      managers: [],
      supervisors: [],
      employees: []
    },
    reviewCycle: {
      frequency: "quarterly",
      startDate: new Date().toISOString().split('T')[0],
      visibility: true
    }
  });

  const currentMilestone = milestones[currentMilestoneIndex];
  const progress = ((currentMilestoneIndex + 1) / milestones.length) * 100;

  const onDataChange = useCallback((updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleNext = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (currentMilestoneIndex < milestones.length - 1) {
        setCurrentMilestoneIndex(prev => prev + 1);
      } else {
        // Complete onboarding and go to dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error proceeding to next milestone:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentMilestoneIndex, navigate]);

  const handleBack = useCallback(() => {
    if (currentMilestoneIndex > 0) {
      setCurrentMilestoneIndex(prev => prev - 1);
    }
  }, [currentMilestoneIndex]);

  const renderMilestone = () => {
    const commonProps = {
      data: onboardingData,
      onDataChange,
      onNext: handleNext,
      onBack: handleBack,
      isLoading
    };

    switch (currentMilestone.id) {
      case 'welcome':
        return <WelcomeIdentityMilestone {...commonProps} />;
      case 'people':
        return <AddYourPeople 
          data={onboardingData} 
          updateData={onDataChange} 
          onNext={handleNext} 
        />;
      case 'structure':
        return <StructureOrg 
          data={onboardingData} 
          updateData={onDataChange} 
          onNext={handleNext} 
        />;
      case 'roles':
        return <AssignRoles 
          data={onboardingData} 
          updateData={onDataChange} 
          onNext={handleNext} 
        />;
      case 'success':
        return <SuccessDashboard 
          data={onboardingData} 
          onNext={handleNext} 
        />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <MilestoneHeader
        milestone={currentMilestone}
        progress={progress}
        currentStep={currentMilestoneIndex + 1}
        totalSteps={milestones.length}
      />

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMilestone.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-1 min-h-0 flex flex-col"
        >
          {renderMilestone()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingFlow;
