
"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Search, Sparkles, User, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              
              {/* Search Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                  <h3 className="text-xl font-semibold text-gray-900">Find Employee</h3>
                </div>
                
                <div className="relative group">
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-600/20 rounded-xl blur-lg transition-all duration-300",
                    isSearchFocused ? "opacity-100 scale-105" : "opacity-0 scale-100"
                  )}></div>
                  <div className="relative">
                    <Search className={cn(
                      "absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-200",
                      isSearchFocused ? "text-blue-500" : "text-muted-foreground"
                    )} />
                    <Input 
                      placeholder="Search by name, department, or position..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      className={cn(
                        "pl-12 pr-6 py-4 text-base bg-white border-2 rounded-xl transition-all duration-200 placeholder:text-muted-foreground/60",
                        isSearchFocused 
                          ? "border-blue-500 shadow-lg shadow-blue-500/10 ring-4 ring-blue-500/10" 
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Employee Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                  <h3 className="text-xl font-semibold text-gray-900">Select Employee</h3>
                </div>
                
                <Select onValueChange={(value) => {
                  const employee = employees.find(e => e.id === value);
                  if (employee) onEmployeeSelect(employee);
                }}>
                  <SelectTrigger className="h-16 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
                    <div className="flex items-center justify-between w-full">
                      <SelectValue 
                        placeholder={
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="h-10 w-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5" />
                            </div>
                            <span>Choose an employee to review</span>
                          </div>
                        }
                      />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-0 shadow-2xl shadow-slate-200/60 rounded-xl p-2">
                    <ScrollArea className="h-72">
                      <div className="space-y-1">
                        {filteredEmployees.map(employee => (
                          <SelectItem 
                            key={employee.id} 
                            value={employee.id}
                            className="rounded-lg p-4 hover:bg-slate-50 transition-colors duration-150 cursor-pointer border-0"
                          >
                            <div className="flex items-center gap-4 w-full">
                              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-semibold">
                                {employee.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="flex-1 text-left">
                                <div className="font-semibold text-gray-900 text-base">
                                  {employee.name}
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                  <span>{employee.position}</span>
                                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                  <span>{employee.department}</span>
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Employee Preview */}
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

              {/* Action Button */}
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
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
