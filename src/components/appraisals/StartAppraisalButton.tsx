
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Employee } from './types';

interface StartAppraisalButtonProps {
  selectedEmployee: Employee | null;
  onStartAppraisal: () => void;
}

export function StartAppraisalButton({ selectedEmployee, onStartAppraisal }: StartAppraisalButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: selectedEmployee ? 1 : 0.6, 
        y: 0,
        scale: selectedEmployee ? 1 : 0.98
      }}
      transition={{ duration: 0.2 }}
      className="pt-4"
    >
      <Button 
        onClick={onStartAppraisal}
        disabled={!selectedEmployee}
        size="lg"
        className={cn(
          "w-full h-14 text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg",
          selectedEmployee 
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105" 
            : "bg-gray-300 cursor-not-allowed"
        )}
      >
        <span className="flex items-center gap-3">
          Begin Appraisal
          <ChevronRight className="h-5 w-5" />
        </span>
      </Button>
    </motion.div>
  );
}
