"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { HelpCircle, ChevronRight, User, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface Step {
  id: number;
  title: string;
  description: string;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
}

export interface AppraisalHeaderProps {
  currentStep: number;
  steps: Step[];
  employee?: Employee | null;
  onShowAuditTrail: () => void;
}

export default function AppraisalHeader({
  currentStep,
  steps,
  employee,
  onShowAuditTrail
}: AppraisalHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Employee Info and Audit Trail - Only show if we have an employee and are past step 0 */}
      {employee && currentStep > 0 && (
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge 
                variant="secondary" 
                className="flex items-center gap-2 px-3 py-2 text-sm"
              >
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">{employee.name}</span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {employee.position} • {employee.department}
                </span>
              </Badge>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onShowAuditTrail}
              className="flex items-center gap-2"
            >
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Audit Trail</span>
            </Button>
          </div>
        </div>
      )}

      {/* Breadcrumb Progress */}
      {currentStep > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex items-center space-x-3 whitespace-nowrap">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                      currentStep === step.id 
                        ? "bg-primary text-primary-foreground" 
                        : currentStep > step.id 
                        ? "bg-green-500 text-white" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {currentStep > step.id ? (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-4 h-4 bg-white rounded-full flex items-center justify-center"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        </motion.div>
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className={cn(
                        "text-sm font-medium",
                        currentStep === step.id 
                          ? "text-foreground" 
                          : currentStep > step.id 
                          ? "text-green-600" 
                          : "text-muted-foreground"
                      )}>
                        {step.title}
                      </span>
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {step.description}
                      </span>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className={cn(
                      "h-4 w-4 mx-2 flex-shrink-0",
                      currentStep > step.id ? "text-green-500" : "text-muted-foreground"
                    )} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Current Step Description (Mobile) */}
          <div className="sm:hidden">
            {steps.find(step => step.id === currentStep) && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-medium text-sm">
                  Step {currentStep}: {steps.find(step => step.id === currentStep)?.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {steps.find(step => step.id === currentStep)?.description}
                </p>
              </div>
            )}
          </div>

          <Separator />
        </div>
      )}
    </div>
  );
}