
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { Employee } from './types';

interface EmployeePreviewProps {
  selectedEmployee: Employee | null;
}

export function EmployeePreview({ selectedEmployee }: EmployeePreviewProps) {
  return (
    <AnimatePresence>
      {selectedEmployee && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-gray-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-gray-900 mb-1 truncate" title={selectedEmployee.name}>
                  {selectedEmployee.name}
                </h4>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Badge variant="outline" className="border-gray-200 text-gray-700 bg-white">
                    {selectedEmployee.position}
                  </Badge>
                  <Badge variant="outline" className="border-gray-200 text-gray-700 bg-white">
                    {selectedEmployee.department}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
