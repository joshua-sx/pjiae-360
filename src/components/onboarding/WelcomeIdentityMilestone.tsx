
"use client";

import * as React from "react";
import { useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, ArrowLeft } from "lucide-react";
import WelcomeHeader from "./components/WelcomeHeader";
import OrganizationDetailsForm from "./components/OrganizationDetailsForm";
import AdministratorInfo from "./components/AdministratorInfo";

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
  const handleOrgNameChange = useCallback((name: string) => {
    onDataChange({ orgName: name });
  }, [onDataChange]);

  const handleLogoChange = useCallback((logo: File | null) => {
    onDataChange({ logo });
  }, [onDataChange]);

  const canProceed = data.orgName.trim().length > 0;

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <ScrollArea className="flex-1">
        <div className="px-4 md:px-12 py-6">
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

              <AdministratorInfo adminInfo={data.adminInfo} />
            </motion.div>
          </div>
        </div>
      </ScrollArea>

      {/* Navigation Footer - Fixed at bottom */}
      <div className="border-t bg-white px-6 py-4 flex-shrink-0">
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
            className="flex-1"
          >
            {isLoading ? "Setting Up..." : "Continue"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
