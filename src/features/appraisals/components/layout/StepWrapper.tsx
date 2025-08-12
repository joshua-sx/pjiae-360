import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface StepWrapperProps {
  children: React.ReactNode;
  stepKey: string;
}

export function StepWrapper({ children, stepKey }: StepWrapperProps) {
  return (
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-sm border-0">
        <CardContent className="p-8">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}