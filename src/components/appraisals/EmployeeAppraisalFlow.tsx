
"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { HelpCircle, ChevronRight, User, CheckCircle, Edit, Signature, Mail, Info, ArrowLeft, ArrowRight, Save, Clock, AlertCircle, Search, Sparkles, Loader, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import AppraisalHeader from "./AppraisalHeader";
import PerformanceGoalsStep from "./PerformanceGoalsStep";
import CoreCompetenciesStep from "./CoreCompetenciesStep";
import ReviewAndSignOffStep from "./ReviewAndSignOffStep";

export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  rating?: number;
  feedback?: string;
}

export interface Competency {
  id: string;
  title: string;
  description: string;
  rating?: number;
  feedback?: string;
}

export interface AppraisalData {
  employeeId: string;
  goals: Goal[];
  competencies: Competency[];
  overallRating?: number;
  status: 'draft' | 'with_second_appraiser' | 'awaiting_employee' | 'complete';
  signatures: {
    appraiser?: string;
    secondAppraiser?: string;
    employee?: string;
  };
  timestamps: {
    created: Date;
    lastModified: Date;
    submitted?: Date;
    completed?: Date;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: string;
  user: string;
  details: string;
}

export interface EmployeeAppraisalFlowProps {
  initialStep?: number;
  onComplete?: (data: AppraisalData) => void;
  onSaveDraft?: (data: AppraisalData) => void;
}

const mockEmployees: Employee[] = [
  { id: "1", name: "Sarah Johnson", department: "Engineering", position: "Senior Developer" },
  { id: "2", name: "Michael Chen", department: "Marketing", position: "Marketing Manager" },
  { id: "3", name: "Emily Rodriguez", department: "Sales", position: "Sales Representative" },
  { id: "4", name: "David Thompson", department: "HR", position: "HR Specialist" },
  { id: "5", name: "Lisa Wang", department: "Finance", position: "Financial Analyst" }
];

const mockGoals: Goal[] = [
  { id: "g1", title: "Increase Team Productivity", description: "Lead initiatives to improve team efficiency by 20% through process optimization and tool implementation." },
  { id: "g2", title: "Complete Professional Development", description: "Attend 3 industry conferences and obtain relevant certification to enhance technical skills." },
  { id: "g3", title: "Mentor Junior Staff", description: "Provide guidance and support to 2 junior team members throughout the year." },
  { id: "g4", title: "Client Satisfaction Improvement", description: "Achieve 95% client satisfaction rating through improved communication and service delivery." }
];

const mockCompetencies: Competency[] = [
  { id: "c1", title: "Communication", description: "Effectively communicates ideas, listens actively, and adapts communication style to audience." },
  { id: "c2", title: "Problem Solving", description: "Identifies issues, analyzes root causes, and develops creative solutions." },
  { id: "c3", title: "Leadership", description: "Inspires and motivates others, delegates effectively, and takes accountability." },
  { id: "c4", title: "Adaptability", description: "Embraces change, learns quickly, and maintains effectiveness in dynamic environments." },
  { id: "c5", title: "Collaboration", description: "Works effectively with others, builds relationships, and contributes to team success." }
];

const steps = [
  { id: 1, title: "Goals", description: "Grade Performance Goals" },
  { id: 2, title: "Competencies", description: "Grade Core Competencies" },
  { id: 3, title: "Review & Sign-Off", description: "Calculate & Review Overall Rating" }
];

export default function EmployeeAppraisalFlow({
  initialStep = 0,
  onComplete,
  onSaveDraft
}: EmployeeAppraisalFlowProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [appraisalData, setAppraisalData] = useState<AppraisalData>({
    employeeId: "",
    goals: mockGoals,
    competencies: mockCompetencies,
    status: 'draft',
    signatures: {},
    timestamps: {
      created: new Date(),
      lastModified: new Date()
    }
  });
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // New state for enhanced UX feedback
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Refs for debouncing
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<string>('');

  const filteredEmployees = mockEmployees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mockAuditLog: AuditLogEntry[] = [
    { id: "1", timestamp: new Date(Date.now() - 86400000), action: "Appraisal Created", user: "John Manager", details: "New appraisal created for Sarah Johnson" },
    { id: "2", timestamp: new Date(Date.now() - 43200000), action: "Goals Rated", user: "John Manager", details: "Performance goals completed and rated" },
    { id: "3", timestamp: new Date(Date.now() - 21600000), action: "Draft Saved", user: "John Manager", details: "Appraisal saved as draft" }
  ];

  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // Silent auto-save function without notifications
  const handleSilentAutoSave = useCallback(async () => {
    if (currentStep === 0 || !appraisalData.employeeId) return;
    
    setIsAutoSaving(true);
    setSaveStatus('saving');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      const updatedData = {
        ...appraisalData,
        timestamps: { ...appraisalData.timestamps, lastModified: new Date() }
      };
      setAppraisalData(updatedData);
      setLastSaved(new Date());
      setSaveStatus('saved');
      
      // Brief success indicator
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Auto-save failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [appraisalData, currentStep]);

  // Manual save with notification
  const handleManualSaveDraft = async () => {
    setIsLoading(true);
    setSaveStatus('saving');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedData = {
        ...appraisalData,
        timestamps: { ...appraisalData.timestamps, lastModified: new Date() }
      };
      setAppraisalData(updatedData);
      setLastSaved(new Date());
      onSaveDraft?.(updatedData);
      setSaveStatus('saved');
      showNotification('success', 'Draft saved successfully');
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      showNotification('error', 'Failed to save draft');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAppraisal = () => {
    if (!selectedEmployee) return;
    setAppraisalData(prev => ({
      ...prev,
      employeeId: selectedEmployee.id,
      timestamps: { ...prev.timestamps, lastModified: new Date() }
    }));
    setCurrentStep(1);
    showNotification('info', 'Appraisal started successfully');
  };

  const handleGoalUpdate = (goalId: string, rating?: number, feedback?: string) => {
    setAppraisalData(prev => ({
      ...prev,
      goals: prev.goals.map(goal => goal.id === goalId ? { ...goal, rating, feedback } : goal),
      timestamps: { ...prev.timestamps, lastModified: new Date() }
    }));
    
    // Show immediate visual feedback
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 500);
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleCompetencyUpdate = (competencyId: string, rating?: number, feedback?: string) => {
    setAppraisalData(prev => ({
      ...prev,
      competencies: prev.competencies.map(competency => competency.id === competencyId ? { ...competency, rating, feedback } : competency),
      timestamps: { ...prev.timestamps, lastModified: new Date() }
    }));
    
    // Show immediate visual feedback
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 500);
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const calculateOverallRating = () => {
    const goalRatings = appraisalData.goals.filter(g => g.rating).map(g => g.rating!);
    const competencyRatings = appraisalData.competencies.filter(c => c.rating).map(c => c.rating!);
    
    if (goalRatings.length === 0 && competencyRatings.length === 0) return 0;
    
    const allRatings = [...goalRatings, ...competencyRatings];
    return Math.round(allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length * 10) / 10;
  };

  const canProceedFromGoals = () => appraisalData.goals.every(goal => goal.rating !== undefined);
  const canProceedFromCompetencies = () => appraisalData.competencies.every(competency => competency.rating !== undefined);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const finalData = {
        ...appraisalData,
        overallRating: calculateOverallRating(),
        status: 'with_second_appraiser' as const,
        timestamps: {
          ...appraisalData.timestamps,
          submitted: new Date(),
          lastModified: new Date()
        }
      };
      setAppraisalData(finalData);
      onComplete?.(finalData);
      showNotification('success', 'Appraisal submitted successfully');
    } catch (error) {
      showNotification('error', 'Failed to submit appraisal');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Debounced auto-save effect
  useEffect(() => {
    if (currentStep === 0 || !appraisalData.employeeId) return;
    
    const currentDataString = JSON.stringify(appraisalData);
    if (currentDataString === lastDataRef.current) return;
    
    lastDataRef.current = currentDataString;
    
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set new timeout for debounced save
    autoSaveTimeoutRef.current = setTimeout(() => {
      handleSilentAutoSave();
    }, 3000);
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [appraisalData, currentStep, handleSilentAutoSave]);

  // Save status indicator component
  const SaveStatusIndicator = () => {
    if (currentStep === 0) return null;
    
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AnimatePresence mode="wait">
          {saveStatus === 'saving' && (
            <motion.div
              key="saving"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1"
            >
              <Loader className="h-3 w-3 animate-spin" />
              <span>Saving...</span>
            </motion.div>
          )}
          
          {saveStatus === 'saved' && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1 text-green-600"
            >
              <Check className="h-3 w-3" />
              <span>Saved</span>
            </motion.div>
          )}
          
          {saveStatus === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1 text-red-600"
            >
              <AlertCircle className="h-3 w-3" />
              <span>Save failed</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {lastSaved && saveStatus === 'idle' && (
          <span className="text-xs">
            Last saved {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <AnimatePresence>
            {notification && (
              <motion.div 
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed top-4 right-4 z-50"
              >
                <Alert className={cn(
                  "w-96 shadow-lg",
                  notification.type === 'success' && "border-green-500 bg-green-50",
                  notification.type === 'error' && "border-red-500 bg-red-50",
                  notification.type === 'info' && "border-blue-500 bg-blue-50"
                )}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{notification.message}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between">
            <AppraisalHeader 
              currentStep={currentStep}
              steps={steps}
              employee={selectedEmployee}
              onShowAuditTrail={() => setShowAuditTrail(true)}
            />
            <SaveStatusIndicator />
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 0 && (
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
                            const employee = mockEmployees.find(e => e.id === value);
                            setSelectedEmployee(employee || null);
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
                            onClick={handleStartAppraisal}
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
            )}

            {currentStep === 1 && (
              <motion.div 
                key="goals-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="shadow-lg">
                  <CardContent className="p-8">
                    <PerformanceGoalsStep 
                      goals={appraisalData.goals}
                      onGoalUpdate={handleGoalUpdate}
                      canProceed={canProceedFromGoals()}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div 
                key="competencies-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="shadow-lg">
                  <CardContent className="p-8">
                    <CoreCompetenciesStep 
                      competencies={appraisalData.competencies}
                      onCompetencyUpdate={handleCompetencyUpdate}
                      canProceed={canProceedFromCompetencies()}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div 
                key="review-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="shadow-lg">
                  <CardContent className="p-8">
                    <ReviewAndSignOffStep 
                      appraisalData={appraisalData}
                      employee={selectedEmployee}
                      overallRating={calculateOverallRating()}
                      onSubmit={handleSubmit}
                      isLoading={isLoading}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Footer - only show when not on step 0 */}
          {currentStep > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-center pt-6"
            >
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} size="lg" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  onClick={handleManualSaveDraft} 
                  disabled={isLoading || saveStatus === 'saving'} 
                  size="lg" 
                  className="flex items-center gap-2"
                >
                  {saveStatus === 'saving' ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isLoading || saveStatus === 'saving' ? 'Saving...' : 'Save Draft'}
                </Button>

                {currentStep < 3 && (
                  <Button 
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 && !canProceedFromGoals()) ||
                      (currentStep === 2 && !canProceedFromCompetencies())
                    }
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Dialog for audit trail */}
          <Dialog open={showAuditTrail} onOpenChange={setShowAuditTrail}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Audit Trail</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {mockAuditLog.map(entry => (
                    <div key={entry.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{entry.action}</h4>
                          <span className="text-xs text-muted-foreground">
                            {entry.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{entry.details}</p>
                        <p className="text-xs text-muted-foreground">by {entry.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </TooltipProvider>
  );
}
