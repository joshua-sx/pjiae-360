"use client";

import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Plus, Search, Filter, Eye, Edit, Download, ChevronDown, ChevronUp, Calendar, User, AlertCircle, RefreshCw, FileText, MoreVertical, Target, Users, CheckCircle, Star, PenTool, ArrowRight, ArrowLeft, Save, SearchX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DataTable } from "@/components/ui/data-table";
import { createAppraisalColumns } from "./appraisals/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Types and interfaces
interface Appraisal {
  id: string;
  employeeName: string;
  employeeAvatar?: string;
  jobTitle: string;
  department: string;
  division?: string;
  appraisalType: string;
  score: number;
  scoreLabel: string;
  dateOfAppraisal: string;
  status: "Completed" | "In Progress" | "Not Started" | "Overdue";
  appraiser: string;
  reviewPeriod: string;
  goals?: Goal[];
  feedback?: string;
  strengths?: string[];
  areasForImprovement?: string[];
  developmentPlan?: string;
  employeeComments?: string;
  managerComments?: string;
  hrComments?: string;
  lastModified: string;
  createdBy: string;
  completedDate?: string;
  dueDate: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  weight: number;
  targetValue: string;
  actualValue: string;
  status: "Achieved" | "Partially Achieved" | "Not Achieved";
  score: number;
  comments?: string;
}

interface AppraisalsPageProps {
  title?: string;
  showDivision?: boolean;
  userRole?: "Employee" | "Manager" | "Appraiser" | "HR";
  userId?: string;
}

// Mock data
const mockAppraisals: Appraisal[] = [
  {
    id: "1",
    employeeName: "Sarah Johnson",
    employeeAvatar: "/avatars/sarah.jpg",
    jobTitle: "Senior Software Engineer",
    department: "Engineering",
    division: "Product Development",
    appraisalType: "Annual Review",
    score: 4.2,
    scoreLabel: "Exceeds Expectations",
    dateOfAppraisal: "2024-03-15",
    status: "Completed",
    appraiser: "Mike Chen",
    reviewPeriod: "2023-2024",
    lastModified: "2024-03-15T10:30:00Z",
    createdBy: "Mike Chen",
    completedDate: "2024-03-15",
    dueDate: "2024-03-20",
    goals: [
      {
        id: "g1",
        title: "Code Quality Improvement",
        description: "Reduce bug reports by 25%",
        category: "Technical",
        weight: 30,
        targetValue: "25% reduction",
        actualValue: "32% reduction",
        status: "Achieved",
        score: 5,
        comments: "Exceeded target through implementation of better testing practices"
      }
    ],
    feedback: "Sarah has shown exceptional technical leadership this year.",
    strengths: ["Technical expertise", "Mentoring junior developers", "Problem-solving"],
    areasForImprovement: ["Public speaking", "Cross-team collaboration"],
    developmentPlan: "Enroll in presentation skills workshop, lead cross-functional project"
  },
  {
    id: "2",
    employeeName: "David Rodriguez",
    jobTitle: "Marketing Manager",
    department: "Marketing",
    division: "Growth",
    appraisalType: "Mid-Year Review",
    score: 3.8,
    scoreLabel: "Meets Expectations",
    dateOfAppraisal: "2024-02-28",
    status: "Completed",
    appraiser: "Lisa Wang",
    reviewPeriod: "H1 2024",
    lastModified: "2024-02-28T14:15:00Z",
    createdBy: "Lisa Wang",
    completedDate: "2024-02-28",
    dueDate: "2024-03-05"
  },
  {
    id: "3",
    employeeName: "Emily Chen",
    jobTitle: "UX Designer",
    department: "Design",
    division: "Product Development",
    appraisalType: "Quarterly Check-in",
    score: 4.5,
    scoreLabel: "Exceeds Expectations",
    dateOfAppraisal: "2024-01-30",
    status: "Completed",
    appraiser: "Alex Thompson",
    reviewPeriod: "Q4 2023",
    lastModified: "2024-01-30T09:45:00Z",
    createdBy: "Alex Thompson",
    completedDate: "2024-01-30",
    dueDate: "2024-02-05"
  },
  {
    id: "4",
    employeeName: "Michael Brown",
    jobTitle: "Sales Representative",
    department: "Sales",
    division: "Revenue",
    appraisalType: "Annual Review",
    score: 3.2,
    scoreLabel: "Needs Improvement",
    dateOfAppraisal: "2024-03-10",
    status: "In Progress",
    appraiser: "Jennifer Davis",
    reviewPeriod: "2023-2024",
    lastModified: "2024-03-10T16:20:00Z",
    createdBy: "Jennifer Davis",
    dueDate: "2024-03-25"
  },
  {
    id: "5",
    employeeName: "Anna Wilson",
    jobTitle: "HR Specialist",
    department: "Human Resources",
    division: "Operations",
    appraisalType: "Probationary Review",
    score: 4.0,
    scoreLabel: "Meets Expectations",
    dateOfAppraisal: "2024-02-15",
    status: "Completed",
    appraiser: "Robert Kim",
    reviewPeriod: "Probation Period",
    lastModified: "2024-02-15T11:30:00Z",
    createdBy: "Robert Kim",
    completedDate: "2024-02-15",
    dueDate: "2024-02-20"
  }
];

const departments = ["All", "Engineering", "Marketing", "Design", "Sales", "Human Resources", "Finance", "Operations"];
const divisions = ["All", "Product Development", "Growth", "Revenue", "Operations"];
const appraisalTypes = ["All", "Annual Review", "Mid-Year Review", "Quarterly Check-in", "Probationary Review"];
const availableYears = ["All", "2024", "2023", "2022"];

export default function AppraisalsPage({
  title = "Appraisals",
  showDivision = true,
  userRole = "HR",
  userId = "current-user"
}: AppraisalsPageProps) {
  const navigate = useNavigate();
  // State management
  const [appraisals, setAppraisals] = useState<Appraisal[]>(mockAppraisals);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(["All"]);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>(["All"]);
  const [selectedAppraisalType, setSelectedAppraisalType] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [sortColumn, setSortColumn] = useState<keyof Appraisal>("dateOfAppraisal");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Appraisal creation wizard
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedAppraisalTypeForCreation, setSelectedAppraisalTypeForCreation] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [wizardData, setWizardData] = useState({
    appraisalType: "",
    reviewPeriod: "",
    dueDate: "",
    employees: [] as string[],
    template: "",
    instructions: ""
  });

  // Handlers
  const handleSort = useCallback((column: keyof Appraisal) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }, [sortColumn]);

  const handleDepartmentChange = useCallback((department: string, checked: boolean) => {
    setSelectedDepartments(prev => {
      if (department === "All") {
        return checked ? ["All"] : [];
      }
      
      const filtered = prev.filter(d => d !== "All");
      if (checked) {
        const newSelection = [...filtered, department];
        return newSelection.length === departments.length - 1 ? ["All"] : newSelection;
      } else {
        return filtered.filter(d => d !== department);
      }
    });
  }, []);

  const handleDivisionChange = useCallback((division: string, checked: boolean) => {
    setSelectedDivisions(prev => {
      if (division === "All") {
        return checked ? ["All"] : [];
      }
      
      const filtered = prev.filter(d => d !== "All");
      if (checked) {
        const newSelection = [...filtered, division];
        return newSelection.length === divisions.length - 1 ? ["All"] : newSelection;
      } else {
        return filtered.filter(d => d !== division);
      }
    });
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    // Simulate retry
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const startAppraisalCreation = useCallback((type: string) => {
    setSelectedAppraisalTypeForCreation(type);
    setWizardData(prev => ({ ...prev, appraisalType: type }));
    setShowWizard(true);
    setWizardStep(1);
  }, []);

  // Computed values
  const filteredAndSortedAppraisals = useMemo(() => {
    let filtered = appraisals.filter(appraisal => {
      const matchesSearch = appraisal.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           appraisal.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           appraisal.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = selectedDepartments.includes("All") || 
                               selectedDepartments.includes(appraisal.department);
      
      const matchesDivision = selectedDivisions.includes("All") || 
                             selectedDivisions.includes(appraisal.division || "");
      
      const matchesType = selectedAppraisalType === "All" || 
                         appraisal.appraisalType === selectedAppraisalType;
      
      const matchesYear = selectedYear === "All" || 
                         new Date(appraisal.dateOfAppraisal).getFullYear().toString() === selectedYear;
      
      return matchesSearch && matchesDepartment && matchesDivision && matchesType && matchesYear;
    });

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    return filtered;
  }, [appraisals, searchTerm, selectedDepartments, selectedDivisions, selectedAppraisalType, selectedYear, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedAppraisals.length / itemsPerPage);
  const paginatedAppraisals = filteredAndSortedAppraisals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helper functions
  const getScoreColor = (label: string) => {
    switch (label) {
      case "Outstanding": return "bg-green-100 text-green-800 border-green-200";
      case "Exceeds Expectations": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Meets Expectations": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Needs Improvement": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Unsatisfactory": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Components
  const SortableHeader = ({ column, children }: { column: keyof Appraisal; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortColumn === column && (
          sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </TableHead>
  );

  const RowActions = ({ appraisal }: { appraisal: Appraisal }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0" align="end">
        <div className="py-1">
          <Button variant="ghost" size="sm" className="w-full justify-start px-3 py-2">
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          {(userRole === "Appraiser" || userRole === "HR") && (
            <Button variant="ghost" size="sm" className="w-full justify-start px-3 py-2">
              <Edit className="w-4 h-4 mr-2" />
              Edit Appraisal
            </Button>
          )}
          <Button variant="ghost" size="sm" className="w-full justify-start px-3 py-2">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );

  const AppraisalWizard = () => (
    <Dialog open={showWizard} onOpenChange={setShowWizard}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Appraisal</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  wizardStep >= step 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={cn(
                    "w-16 h-0.5 mx-2",
                    wizardStep > step ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Appraisal Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Appraisal Type</label>
                  <Select 
                    value={wizardData.appraisalType} 
                    onValueChange={(value) => setWizardData(prev => ({ ...prev, appraisalType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Annual Review">Annual Review</SelectItem>
                      <SelectItem value="Mid-Year Review">Mid-Year Review</SelectItem>
                      <SelectItem value="Quarterly Check-in">Quarterly Check-in</SelectItem>
                      <SelectItem value="Probationary Review">Probationary Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Review Period</label>
                  <Input 
                    value={wizardData.reviewPeriod}
                    onChange={(e) => setWizardData(prev => ({ ...prev, reviewPeriod: e.target.value }))}
                    placeholder="e.g., 2024 Annual, Q1 2024"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input 
                  type="date"
                  value={wizardData.dueDate}
                  onChange={(e) => setWizardData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setWizardStep(prev => Math.max(prev - 1, 1))}
              disabled={wizardStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button 
              onClick={() => {
                if (wizardStep < 4) {
                  setWizardStep(prev => prev + 1);
                } else {
                  // Create appraisal
                  setShowWizard(false);
                  setWizardStep(1);
                }
              }}
            >
              {wizardStep < 4 ? (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Appraisal
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (error) {
    return <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{title}</h1>
              <p className="text-lg text-muted-foreground">Manage and review performance appraisals</p>
            </div>
            {(userRole === "Appraiser" || userRole === "HR") && <Button className="flex items-center gap-2 px-6 py-2 rounded-lg shadow-lg" onClick={() => startAppraisalCreation("Mid-Year")}>
                <Plus className="w-4 h-4" />
                New Appraisal
              </Button>}
          </header>
          
          <Card className="max-w-md mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-16 h-16 text-destructive mb-6" />
              <h3 className="text-xl font-semibold mb-3">Failed to load appraisals</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                We encountered an error while loading your appraisals. Please check your connection and try again.
              </p>
              <Button onClick={handleRetry} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>;
  }

  return <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-lg text-muted-foreground">Manage and review performance appraisals</p>
          {userRole !== "HR" && <Badge variant="outline" className="mt-2">
              {userRole} View
            </Badge>}
        </div>
        
        {/* New Appraisal Button - now inline with header */}
        {(userRole === "Appraiser" || userRole === "HR") && <Button className="bg-primary text-primary-foreground shadow-lg px-6 py-3 rounded-lg flex items-center gap-2 transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus:outline-none" onClick={() => {
          navigate('/appraisals/new');
        }}>
            <Plus className="w-5 h-5" />
            <span className="font-medium">New Appraisal</span>
          </Button>}
      </header>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="search" placeholder="Search employees..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>

            {/* Appraisal Type */}
            <div className="space-y-2">
              <label htmlFor="appraisal-type" className="text-sm font-medium">Appraisal Type</label>
              <Select value={selectedAppraisalType} onValueChange={setSelectedAppraisalType}>
                <SelectTrigger id="appraisal-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {appraisalTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Year Filter */}
            <div className="space-y-2">
              <label htmlFor="year-filter" className="text-sm font-medium">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger id="year-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedDepartments.includes("All") ? "All Departments" : selectedDepartments.length === 1 ? selectedDepartments[0] : `${selectedDepartments.length} selected`}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="p-4 space-y-2">
                    {departments.map(dept => <div key={dept} className="flex items-center space-x-2">
                        <Checkbox id={`dept-${dept}`} checked={selectedDepartments.includes(dept)} onCheckedChange={checked => handleDepartmentChange(dept, !!checked)} />
                        <label htmlFor={`dept-${dept}`} className="text-sm">{dept}</label>
                      </div>)}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Division (conditional) */}
            {showDivision && <div className="space-y-2">
                <label className="text-sm font-medium">Division</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedDivisions.includes("All") ? "All Divisions" : selectedDivisions.length === 1 ? selectedDivisions[0] : `${selectedDivisions.length} selected`}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <div className="p-4 space-y-2">
                      {divisions.map(div => <div key={div} className="flex items-center space-x-2">
                          <Checkbox id={`div-${div}`} checked={selectedDivisions.includes(div)} onCheckedChange={checked => handleDivisionChange(div, !!checked)} />
                          <label htmlFor={`div-${div}`} className="text-sm">{div}</label>
                        </div>)}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? <div className="p-6 space-y-4">
              {Array.from({
            length: 5
          }).map((_, i) => <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                  <Skeleton className="h-6 w-[80px]" />
                  <Skeleton className="h-6 w-[60px]" />
                </div>)}
            </div> : filteredAndSortedAppraisals.length === 0 ? <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <SearchX className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">No reviews match your filters</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Try adjusting your search criteria or filters to find the appraisals you're looking for.
              </p>
              {(userRole === "Appraiser" || userRole === "HR") && <Button className="flex items-center gap-2" onClick={() => startAppraisalCreation("Mid-Year")}>
                  <Plus className="w-4 h-4" />
                  Create New Appraisal
                </Button>}
            </div> : <>
              <div className="p-6">
                <DataTable
                  columns={createAppraisalColumns(userRole)}
                  data={paginatedAppraisals}
                  enableSorting={true}
                  enableFiltering={false}
                  enableHorizontalScroll={true}
                  enablePagination={false}
                  onRowClick={(appraisal) => {
                    // Handle row click - could navigate to detail view
                    console.log('Clicked appraisal:', appraisal);
                  }}
                />
              </div>

              {/* Pagination */}
              {totalPages > 1 && <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedAppraisals.length)} of {filteredAndSortedAppraisals.length} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({
                  length: Math.min(5, totalPages)
                }, (_, i) => {
                  const page = i + 1;
                  return <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(page)} className="w-8 h-8 p-0">
                            {page}
                          </Button>;
                })}
                      {totalPages > 5 && <>
                          <span className="text-muted-foreground">...</span>
                          <Button variant={currentPage === totalPages ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(totalPages)} className="w-8 h-8 p-0">
                            {totalPages}
                          </Button>
                        </>}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                      Next
                    </Button>
                  </div>
                </div>}
            </>}
        </CardContent>
      </Card>

      {/* Appraisal Creation Wizard */}
      <AppraisalWizard />
    </div>;
}
