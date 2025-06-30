
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmployeeCombobox } from './EmployeeCombobox';
import { EmployeePreview } from './EmployeePreview';
import { StartAppraisalButton } from './StartAppraisalButton';
import { Employee } from './types';

interface EmployeeSelectionStepProps {
  employees: Employee[];
  selectedEmployee: Employee | null;
  onEmployeeSelect: (employee: Employee) => void;
  onStartAppraisal: () => void;
}

export default function EmployeeSelectionStep({
  employees,
  selectedEmployee,
  onEmployeeSelect,
  onStartAppraisal
}: EmployeeSelectionStepProps) {
  return (
    <motion.div 
      key="employee-selection"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      {/* Hero Section */}
      <div className="text-center space-y-6 pt-8 pb-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-full text-blue-700"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Performance Review</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent"
        >
          Start New Appraisal
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Create a comprehensive performance review that drives growth and recognition. 
          Select an employee to begin their appraisal journey.
        </motion.p>
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12">
            <div className="max-w-lg mx-auto space-y-10">
              <EmployeeCombobox
                employees={employees}
                selectedEmployee={selectedEmployee}
                onEmployeeSelect={onEmployeeSelect}
              />

              <EmployeePreview selectedEmployee={selectedEmployee} />

              <StartAppraisalButton
                selectedEmployee={selectedEmployee}
                onStartAppraisal={onStartAppraisal}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
