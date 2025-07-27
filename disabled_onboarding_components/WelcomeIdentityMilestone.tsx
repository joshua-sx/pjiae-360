
"use client";

import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import WelcomeHeader from "./components/WelcomeHeader";
import OrganizationDetailsForm from "./components/OrganizationDetailsForm";
import OnboardingStepLayout from "./components/OnboardingStepLayout";

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
    firstName: string;
    lastName: string;
    email: string;
    jobTitle: string;
    department: string;
    division: string;
    employeeId?: number;
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
}

export interface WelcomeIdentityMilestoneProps {
  data: OnboardingData;
  onDataChange: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export default function WelcomeIdentityMilestone({
  data,
  onDataChange,
  onNext,
  onBack,
  isLoading = false
}: WelcomeIdentityMilestoneProps) {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const handleOrgNameChange = useCallback((name: string) => {
    onDataChange({ orgName: name });
    
    // Real-time validation
    if (name.trim().length === 0) {
      setValidationErrors(["Organization name is required"]);
    } else if (name.trim().length < 2) {
      setValidationErrors(["Organization name must be at least 2 characters"]);
    } else {
      setValidationErrors([]);
    }
  }, [onDataChange]);

  const handleLogoChange = useCallback((logo: File | null) => {
    onDataChange({ logo });
  }, [onDataChange]);

  const canProceed = data.orgName.trim().length >= 2 && validationErrors.length === 0;

  // Auto-save functionality
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (data.orgName.trim()) {
        console.log('Auto-saving organization data...');
        // In a real app, this would save to localStorage or backend
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [data.orgName]);

  return (
    <OnboardingStepLayout
      onBack={onBack}
      onNext={onNext}
      nextLabel={isLoading ? "Setting Up..." : "Continue →"}
      nextDisabled={!canProceed || isLoading}
      isLoading={isLoading}
      maxWidth="2xl"
    >
      <div className="max-w-2xl mx-auto">
          <WelcomeHeader />

          {/* Main Form */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="space-y-6"
          >
            <OrganizationDetailsForm
              orgName={data.orgName}
              logo={data.logo}
              onOrgNameChange={handleOrgNameChange}
              onLogoChange={handleLogoChange}
            />

            {/* Validation feedback - only show if there are errors */}
            {validationErrors.length > 0 && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{validationErrors[0]}</span>
              </div>
            )}
          </motion.div>
        </div>
    </OnboardingStepLayout>
  );
}
