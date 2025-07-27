
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Step, Employee } from './types';

export interface AppraisalHeaderProps {
  currentStep: number;
  steps: Step[];
  employee?: Employee | null;
}

export default function AppraisalHeader({
  currentStep,
  steps,
  employee
}: AppraisalHeaderProps) {
  return (
    <div className="space-y-6 w-full">
      {/* Employee Profile Section */}
      {employee && (
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={employee.avatar} alt={employee.name} />
            <AvatarFallback className="text-lg font-semibold">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-foreground">{employee.name}</h2>
            <p className="text-sm text-muted-foreground">{employee.position}</p>
            <p className="text-sm text-muted-foreground">{employee.department}</p>
          </div>
        </div>
      )}

      {/* Progress Steps Section */}
      {currentStep > 0 && (
        <div className="space-y-4">
          <div className="w-full">
            <div className="grid grid-cols-3 gap-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-3">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors",
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
                        className="w-5 h-5 bg-white rounded-full flex items-center justify-center"
                      >
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                      </motion.div>
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className={cn(
                      "text-sm font-medium truncate",
                      currentStep === step.id 
                        ? "text-foreground"
                        : currentStep > step.id 
                          ? "text-green-600"
                          : "text-muted-foreground"
                    )}>
                      {step.title}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {step.description}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className={cn(
                      "h-4 w-4 flex-shrink-0",
                      currentStep > step.id ? "text-green-500" : "text-muted-foreground"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="md:hidden">
            {steps.find(step => step.id === currentStep) && (
              <div className="p-4 bg-muted/50 rounded-lg">
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
