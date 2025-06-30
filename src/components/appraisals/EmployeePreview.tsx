
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
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
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-gray-900 mb-1">
                  {selectedEmployee.name}
                </h4>
                <div className="flex items-center gap-3 text-sm text-blue-700">
                  <Badge variant="outline" className="border-blue-200 text-blue-700 bg-white">
                    {selectedEmployee.position}
                  </Badge>
                  <Badge variant="outline" className="border-blue-200 text-blue-700 bg-white">
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
