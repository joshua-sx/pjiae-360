
"use client";

import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import WelcomeHeader from "./components/WelcomeHeader";
import OrganizationDetailsForm from "./components/OrganizationDetailsForm";
import AdministratorInfo from "./components/AdministratorInfo";
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
    <div className="flex-1 flex flex-col bg-slate-50">
      <div className="px-6 py-8 flex-1">
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

            {/* Validation feedback */}
            {validationErrors.length > 0 && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{validationErrors[0]}</span>
              </div>
            )}

            {canProceed && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Ready to proceed!</span>
              </div>
            )}

            <AdministratorInfo adminInfo={data.adminInfo} />
          </motion.div>
        </div>
      </div>

      {/* Navigation Footer - Fixed at bottom */}
      <div className="border-t bg-white px-6 py-4 flex-shrink-0 shadow-lg">
        <div className="max-w-2xl mx-auto flex gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={true}
            className="flex-1 opacity-50 cursor-not-allowed"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <Button
            onClick={onNext}
            disabled={!canProceed || isLoading}
            className="flex-1 relative"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Setting Up...</span>
              </div>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
