
import { useState, useCallback, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Users, UserCog, Layers, Calendar, CheckCircle, Upload, MapPin, Eye } from "lucide-react";
import MilestoneHeader, { Milestone } from "./MilestoneHeader";
import WelcomeIdentityMilestone from "./WelcomeIdentityMilestone";
import AddYourPeople from "./AddYourPeople";
import ColumnMapping from "./ColumnMapping";
import PreviewConfirm from "./PreviewConfirm";
import ImportSummary from "./ImportSummary";
import AssignRoles from "./AssignRoles";
import StructureOrg from "./StructureOrg";
import ReviewCycles from "./ReviewCycles";
import SuccessDashboard from "./SuccessDashboard";

export interface OnboardingData {
  orgName: string;
  logo: File | null;
  adminInfo: {
    name: string;
    email: string;
    role: string;
  };
  csvData: {
    rawData: string;
    headers: string[];
    rows: any[][];
    columnMapping: Record<string, string>;
  };
  people: Array<{
    id: string;
    name: string;
    email: string;
    department?: string;
    role?: string;
    errors?: string[];
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
  importStats: {
    total: number;
    successful: number;
    errors: number;
  };
}

const milestones: Milestone[] = [
  {
    id: 'welcome',
    title: 'Welcome & Organization Setup',
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
    id: 'mapping',
    title: 'Column Mapping',
    icon: MapPin,
    description: 'Map CSV columns to fields'
  },
  {
    id: 'preview',
    title: 'Preview & Confirm',
    icon: Eye,
    description: 'Review imported data'
  },
  {
    id: 'import-summary',
    title: 'Import Summary',
    icon: CheckCircle,
    description: 'Import completion status'
  },
  {
    id: 'roles',
    title: 'Assign Roles',
    icon: UserCog,
    description: 'Set roles for your team'
  },
  {
    id: 'structure',
    title: 'Structure Your Org',
    icon: Layers,
    description: 'Define departments and divisions'
  },
  {
    id: 'review-cycles',
    title: 'Review Cycles',
    icon: Calendar,
    description: 'Set up review frequency'
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
    csvData: {
      rawData: "",
      headers: [],
      rows: [],
      columnMapping: {}
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
    },
    importStats: {
      total: 0,
      successful: 0,
      errors: 0
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

  const handleSkipTo = useCallback((stepIndex: number) => {
    setCurrentMilestoneIndex(stepIndex);
  }, []);

  const renderMilestone = () => {
    const commonProps = {
      data: onboardingData,
      onDataChange,
      onNext: handleNext,
      onBack: handleBack,
      onSkipTo: handleSkipTo,
      isLoading
    };

    switch (currentMilestone.id) {
      case 'welcome':
        return <WelcomeIdentityMilestone {...commonProps} />;
      case 'people':
        return <AddYourPeople {...commonProps} />;
      case 'mapping':
        return <ColumnMapping {...commonProps} />;
      case 'preview':
        return <PreviewConfirm {...commonProps} />;
      case 'import-summary':
        return <ImportSummary {...commonProps} />;
      case 'roles':
        return <AssignRoles {...commonProps} />;
      case 'structure':
        return <StructureOrg {...commonProps} />;
      case 'review-cycles':
        return <ReviewCycles {...commonProps} />;
      case 'success':
        return <SuccessDashboard {...commonProps} />;
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
