
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
      className="pt-2"
    >
      <Button 
        onClick={onStartAppraisal}
        disabled={!selectedEmployee}
        size="lg"
        aria-label="Begin Appraisal for selected employee"
        className={cn(
          "w-full h-12 text-base font-medium rounded-lg transition-all duration-300",
          selectedEmployee 
            ? "bg-black hover:bg-gray-800 text-white hover:scale-[1.02]" 
            : "bg-gray-300 cursor-not-allowed"
        )}
      >
        <span className="flex items-center gap-2">
          Begin Appraisal
          <ChevronRight className="h-4 w-4" />
        </span>
      </Button>
    </motion.div>
  );
}
