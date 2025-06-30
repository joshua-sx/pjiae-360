
"use client";

import * as React from "react";
import { useState, useCallback, useMemo } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DashboardLayout } from "./DashboardLayout";

export interface Goal {
  id: string;
  title: string;
  description: string;
  weight: number;
  rating?: number;
  comments?: string;
}

export interface Competency {
  id: string;
  name: string;
  description: string;
  rating?: number;
  comments?: string;
}

export interface AppraisalData {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  jobTitle: string;
  department: string;
  division?: string;
  appraisalType: "Mid-Year" | "Year-End";
  year: number;
  version: number;
  goals: Goal[];
  competencies: Competency[];
  goalScore?: number;
  competencyScore?: number;
  finalScore?: number;
  status: "Draft" | "In Review" | "Completed" | "Pending" | "Overdue";
  dateCreated: string;
  dateCompleted?: string;
  appraiserSignatures: string[];
}

export interface Appraisal {
  id: string;
  employeeName: string;
  employeeAvatar?: string;
  jobTitle: string;
  department: string;
  division?: string;
  appraisalType: string;
  score: number;
  scoreLabel: string;
  status: "In Review" | "Completed" | "Pending" | "Overdue";
  dateOfAppraisal: string;
}

export interface AppraisalsPageProps {
  title?: string;
  showDivision?: boolean;
  userRole?: "Employee" | "Appraiser" | "HR";
  userId?: string;
}

// Mock data for goals and competencies
const mockGoals: Goal[] = [
  {
    id: "1",
    title: "Complete Project Alpha",
    description: "Successfully deliver Project Alpha on time and within budget",
    weight: 30
  },
  {
    id: "2",
    title: "Improve Team Collaboration",
    description: "Enhance cross-functional team communication and collaboration",
    weight: 25
  },
  {
    id: "3",
    title: "Develop Technical Skills",
    description: "Learn new technologies and improve existing technical competencies",
    weight: 25
  },
  {
    id: "4",
    title: "Mentor Junior Staff",
    description: "Provide guidance and mentorship to junior team members",
    weight: 20
  }
];

const mockCompetencies: Competency[] = [
  {
    id: "1",
    name: "Communication",
    description: "Ability to communicate effectively with team members and stakeholders"
  },
  {
    id: "2",
    name: "Problem Solving",
    description: "Capability to identify, analyze, and solve complex problems"
  },
  {
    id: "3",
    name: "Leadership",
    description: "Demonstrates leadership qualities and ability to guide others"
  },
  {
    id: "4",
    name: "Adaptability",
    description: "Flexibility to adapt to changing requirements and environments"
  },
  {
    id: "5",
    name: "Innovation",
    description: "Brings creative solutions and innovative thinking to work"
  }
];

// Mock data
const mockAppraisals: Appraisal[] = [
  {
    id: "1",
    employeeName: "Sarah Johnson",
    employeeAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face",
    jobTitle: "Senior Frontend Developer",
    department: "Engineering",
    division: "Technology",
    appraisalType: "Year-End",
    score: 4.8,
    scoreLabel: "Excellent",
    status: "Completed",
    dateOfAppraisal: "2024-01-15"
  },
  {
    id: "2",
    employeeName: "Michael Chen",
    employeeAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
    jobTitle: "Product Manager",
    department: "Product",
    division: "Strategy",
    appraisalType: "Mid-Year",
    score: 4.2,
    scoreLabel: "Very Good",
    status: "In Review",
    dateOfAppraisal: "2024-01-10"
  },
  {
    id: "3",
    employeeName: "Emily Rodriguez",
    employeeAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
    jobTitle: "UX Designer",
    department: "Design",
    division: "Technology",
    appraisalType: "Year-End",
    score: 3.7,
    scoreLabel: "Good",
    status: "Completed",
    dateOfAppraisal: "2024-01-08"
  },
  {
    id: "4",
    employeeName: "David Kim",
    jobTitle: "Backend Developer",
    department: "Engineering",
    division: "Technology",
    appraisalType: "Mid-Year",
    score: 2.8,
    scoreLabel: "Needs Improvement",
    status: "Pending",
    dateOfAppraisal: "2024-01-05"
  },
  {
    id: "5",
    employeeName: "Lisa Thompson",
    employeeAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
    jobTitle: "Marketing Manager",
    department: "Marketing",
    division: "Growth",
    appraisalType: "Year-End",
    score: 1.9,
    scoreLabel: "Poor",
    status: "Overdue",
    dateOfAppraisal: "2023-12-20"
  },
  {
    id: "6",
    employeeName: "James Wilson",
    jobTitle: "Sales Representative",
    department: "Sales",
    division: "Revenue",
    appraisalType: "Mid-Year",
    score: 4.5,
    scoreLabel: "Very Good",
    status: "Completed",
    dateOfAppraisal: "2024-01-12"
  }
];

const departments = ["All", "Engineering", "Product", "Design", "Marketing", "Sales"];
const divisions = ["All", "Technology", "Strategy", "Growth", "Revenue"];
const appraisalTypes = ["All", "Mid-Year", "Year-End", "Quarterly", "Custom"];

// Get unique years from appraisals
const getAvailableYears = () => {
  const years = mockAppraisals.map(appraisal => new Date(appraisal.dateOfAppraisal).getFullYear());
  const uniqueYears = Array.from(new Set(years)).sort((a, b) => b - a);
  return ["All", ...uniqueYears.map(year => year.toString())];
};

const getScoreColor = (scoreLabel: string) => {
  switch (scoreLabel) {
    case "Excellent":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "Very Good":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "Good":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "Needs Improvement":
      return "bg-orange-100 text-orange-800 hover:bg-orange-100";
    case "Poor":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

const getRatingLabel = (rating: number) => {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 3.5) return "Very Good";
  if (rating >= 2.5) return "Good";
  if (rating >= 1.5) return "Needs Improvement";
  return "Poor";
};

function AppraisalsPage({
  title = "Appraisals",
  showDivision = true,
  userRole = "HR",
  userId = "current-user"
}: AppraisalsPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(["All"]);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>(["All"]);
  const [selectedAppraisalType, setSelectedAppraisalType] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [sortColumn, setSortColumn] = useState<keyof Appraisal | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Appraisal creation wizard state
  const [showAppraisalWizard, setShowAppraisalWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedAppraisalTypeForCreation, setSelectedAppraisalTypeForCreation] = useState<"Mid-Year" | "Year-End">("Mid-Year");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [currentGoals, setCurrentGoals] = useState<Goal[]>([]);
  const [currentCompetencies, setCurrentCompetencies] = useState<Competency[]>([]);
  const [appraiserName, setAppraiserName] = useState("John Appraiser");
  const [digitalSignature, setDigitalSignature] = useState("");

  const availableYears = getAvailableYears();

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
      const newSelection = checked ? [...prev.filter(d => d !== "All"), department] : prev.filter(d => d !== department);
      return newSelection.length === 0 ? ["All"] : newSelection;
    });
  }, []);

  const handleDivisionChange = useCallback((division: string, checked: boolean) => {
    setSelectedDivisions(prev => {
      if (division === "All") {
        return checked ? ["All"] : [];
      }
      const newSelection = checked ? [...prev.filter(d => d !== "All"), division] : prev.filter(d => d !== division);
      return newSelection.length === 0 ? ["All"] : newSelection;
    });
  }, []);

  const startAppraisalCreation = (type: "Mid-Year" | "Year-End") => {
    setSelectedAppraisalTypeForCreation(type);
    setCurrentGoals(mockGoals.map(goal => ({
      ...goal,
      rating: undefined,
      comments: ""
    })));
    setCurrentCompetencies(mockCompetencies.map(comp => ({
      ...comp,
      rating: undefined,
      comments: ""
    })));
    setWizardStep(1);
    setShowAppraisalWizard(true);
  };

  const updateGoalRating = (goalId: string, rating: number) => {
    setCurrentGoals(prev => prev.map(goal => goal.id === goalId ? { ...goal, rating } : goal));
  };

  const updateGoalComments = (goalId: string, comments: string) => {
    setCurrentGoals(prev => prev.map(goal => goal.id === goalId ? { ...goal, comments } : goal));
  };

  const updateCompetencyRating = (competencyId: string, rating: number) => {
    setCurrentCompetencies(prev => prev.map(comp => comp.id === competencyId ? { ...comp, rating } : comp));
  };

  const updateCompetencyComments = (competencyId: string, comments: string) => {
    setCurrentCompetencies(prev => prev.map(comp => comp.id === competencyId ? { ...comp, comments } : comp));
  };

  const calculateScores = () => {
    // Calculate goal score (weighted average)
    const totalGoalWeight = currentGoals.reduce((sum, goal) => sum + goal.weight, 0);
    const goalScore = currentGoals.reduce((sum, goal) => {
      if (goal.rating) {
        return sum + (goal.rating * goal.weight) / totalGoalWeight;
      }
      return sum;
    }, 0);

    // Calculate competency score (simple average)
    const ratedCompetencies = currentCompetencies.filter(comp => comp.rating);
    const competencyScore = ratedCompetencies.length > 0 
      ? ratedCompetencies.reduce((sum, comp) => sum + comp.rating!, 0) / ratedCompetencies.length 
      : 0;

    // Calculate final score for Year-End (Goals 70%, Competencies 30%)
    let finalScore = 0;
    if (selectedAppraisalTypeForCreation === "Year-End") {
      finalScore = goalScore * 0.7 + competencyScore * 0.3;
    } else {
      finalScore = goalScore; // Mid-year focuses on goals
    }

    return { goalScore, competencyScore, finalScore };
  };

  const completeAppraisal = () => {
    if (!digitalSignature.trim()) {
      alert("Please provide your digital signature to complete the appraisal.");
      return;
    }

    const scores = calculateScores();
    console.log("Appraisal completed:", {
      type: selectedAppraisalTypeForCreation,
      employee: selectedEmployee,
      goals: currentGoals,
      competencies: currentCompetencies,
      scores,
      appraiser: appraiserName,
      signature: digitalSignature,
      date: new Date().toISOString()
    });

    // Reset wizard
    setShowAppraisalWizard(false);
    setWizardStep(1);
    setDigitalSignature("");
    alert("Appraisal completed successfully!");
  };

  const filteredAndSortedAppraisals = useMemo(() => {
    let filtered = mockAppraisals.filter(appraisal => {
      // Search filter
      const matchesSearch = appraisal.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appraisal.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appraisal.department.toLowerCase().includes(searchTerm.toLowerCase());

      // Department filter
      const matchesDepartment = selectedDepartments.includes("All") || selectedDepartments.includes(appraisal.department);

      // Division filter
      const matchesDivision = !showDivision || selectedDivisions.includes("All") || 
        (appraisal.division && selectedDivisions.includes(appraisal.division));

      // Appraisal type filter
      const matchesType = selectedAppraisalType === "All" || appraisal.appraisalType === selectedAppraisalType;

      // Year filter
      const appraisalYear = new Date(appraisal.dateOfAppraisal).getFullYear().toString();
      const matchesYear = selectedYear === "All" || appraisalYear === selectedYear;

      return matchesSearch && matchesDepartment && matchesDivision && matchesType && matchesYear;
    });

    // Sort
    if (sortColumn) {
      filtered.sort((a, b) => {
        let aValue = a[sortColumn];
        let bValue = b[sortColumn];

        if (sortColumn === "score") {
          aValue = Number(aValue);
          bValue = Number(bValue);
        } else if (sortColumn === "dateOfAppraisal") {
          aValue = new Date(aValue as string).getTime();
          bValue = new Date(bValue as string).getTime();
        } else {
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [searchTerm, selectedDepartments, selectedDivisions, selectedAppraisalType, selectedYear, sortColumn, sortDirection, showDivision]);

  const paginatedAppraisals = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedAppraisals.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedAppraisals, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedAppraisals.length / itemsPerPage);

  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    // Simulate retry
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const SortableHeader = ({ column, children }: { column: keyof Appraisal; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors select-none" 
      onClick={() => handleSort(column)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSort(column);
        }
      }}
      tabIndex={0}
      role="button"
      aria-sort={sortColumn === column ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortColumn === column && (
          sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </TableHead>
  );

  // RowActions subcomponent
  function RowActions({ appraisal }: { appraisal: Appraisal }) {
    const [open, setOpen] = React.useState(false);
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    // Keyboard accessibility: close on escape
    React.useEffect(() => {
      if (!open) return;
      function onKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape") setOpen(false);
      }
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [open]);

    // Close on click outside
    React.useEffect(() => {
      if (!open) return;
      function onClick(e: MouseEvent) {
        if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      }
      window.addEventListener("mousedown", onClick);
      return () => window.removeEventListener("mousedown", onClick);
    }, [open]);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                ref={buttonRef}
                aria-label="Actions"
                className="rounded-full p-0.5 w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-accent focus:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                tabIndex={0}
                onClick={() => setOpen(v => !v)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setOpen(v => !v);
                  }
                }}
              >
                <MoreVertical className="w-5 h-5" />
                <span className="sr-only">Actions</span>
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8}>
            Actions
          </TooltipContent>
        </Tooltip>
        <PopoverContent align="end" sideOffset={8} className="w-48 p-1.5 bg-white shadow-xl rounded-xl border border-muted z-50">
          <ul className="flex flex-col" role="menu" aria-label="Row actions">
            <li>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent focus:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    tabIndex={0}
                    aria-label="View Appraisal"
                    onClick={() => {
                      setOpen(false);
                      console.log('View Appraisal', appraisal);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>View Appraisal</TooltipContent>
              </Tooltip>
            </li>
            <li>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent focus:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    tabIndex={0}
                    aria-label="Edit Appraisal"
                    onClick={() => {
                      setOpen(false);
                      console.log('Edit Appraisal', appraisal);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>Edit Appraisal</TooltipContent>
              </Tooltip>
            </li>
            <li>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent focus:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    tabIndex={0}
                    aria-label="Download Appraisal"
                    onClick={() => {
                      setOpen(false);
                      console.log('Download Appraisal', appraisal);
                    }}
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>Download Appraisal</TooltipContent>
              </Tooltip>
            </li>
          </ul>
        </PopoverContent>
      </Popover>
    );
  }

  // Appraisal Creation Wizard Component
  function AppraisalWizard() {
    const scores = calculateScores();
    const totalSteps = 3;

    return (
      <Dialog open={showAppraisalWizard} onOpenChange={setShowAppraisalWizard}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {selectedAppraisalTypeForCreation === "Mid-Year" ? (
                  <Target className="w-6 h-6 text-blue-600" />
                ) : (
                  <Star className="w-6 h-6 text-yellow-600" />
                )}
                <span>Create {selectedAppraisalTypeForCreation} Appraisal</span>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    wizardStep >= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {wizardStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                </div>
                {step < totalSteps && (
                  <div
                    className={cn(
                      "w-16 h-0.5 mx-2 transition-colors",
                      wizardStep > step ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          <ScrollArea className="max-h-[60vh] pr-4">
            {/* Step 1: Goals Rating */}
            {wizardStep === 1 && (
              <div className="space-y-6">
                <header>
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Rate Goals
                  </h3>
                  <p className="text-muted-foreground">
                    Rate each goal on a scale of 1-5 and provide optional comments.
                  </p>
                </header>

                <div className="space-y-4">
                  {currentGoals.map((goal) => (
                    <Card key={goal.id} className="p-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium">{goal.title}</h4>
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                          <Badge variant="outline" className="mt-2">Weight: {goal.weight}%</Badge>
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-medium">Rating (1-5)</label>
                          <RadioGroup
                            value={goal.rating?.toString() || ""}
                            onValueChange={(value) => updateGoalRating(goal.id, parseInt(value))}
                            className="flex gap-4"
                          >
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <div key={rating} className="flex items-center space-x-2">
                                <RadioGroupItem value={rating.toString()} id={`goal-${goal.id}-${rating}`} />
                                <label htmlFor={`goal-${goal.id}-${rating}`} className="text-sm cursor-pointer">
                                  {rating}
                                </label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor={`goal-comments-${goal.id}`} className="text-sm font-medium">
                            Comments (Optional)
                          </label>
                          <Textarea
                            id={`goal-comments-${goal.id}`}
                            placeholder="Add your comments about this goal..."
                            value={goal.comments || ""}
                            onChange={(e) => updateGoalComments(goal.id, e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Competencies Rating */}
            {wizardStep === 2 && (
              <div className="space-y-6">
                <header>
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Rate Competencies
                  </h3>
                  <p className="text-muted-foreground">
                    Rate each competency on a scale of 1-5 and provide optional comments.
                  </p>
                </header>

                <div className="space-y-4">
                  {currentCompetencies.map((competency) => (
                    <Card key={competency.id} className="p-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium">{competency.name}</h4>
                          <p className="text-sm text-muted-foreground">{competency.description}</p>
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-medium">Rating (1-5)</label>
                          <RadioGroup
                            value={competency.rating?.toString() || ""}
                            onValueChange={(value) => updateCompetencyRating(competency.id, parseInt(value))}
                            className="flex gap-4"
                          >
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <div key={rating} className="flex items-center space-x-2">
                                <RadioGroupItem value={rating.toString()} id={`comp-${competency.id}-${rating}`} />
                                <label htmlFor={`comp-${competency.id}-${rating}`} className="text-sm cursor-pointer">
                                  {rating}
                                </label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor={`comp-comments-${competency.id}`} className="text-sm font-medium">
                            Comments (Optional)
                          </label>
                          <Textarea
                            id={`comp-comments-${competency.id}`}
                            placeholder="Add your comments about this competency..."
                            value={competency.comments || ""}
                            onChange={(e) => updateCompetencyComments(competency.id, e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Review and Sign */}
            {wizardStep === 3 && (
              <div className="space-y-6">
                <header>
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <PenTool className="w-5 h-5" />
                    Review & Sign
                  </h3>
                  <p className="text-muted-foreground">
                    Review the scores and provide your digital signature to complete the appraisal.
                  </p>
                </header>

                {/* Score Summary */}
                <Card className="p-6">
                  <h4 className="font-semibold mb-4">Score Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{scores.goalScore.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">Goals Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{scores.competencyScore.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">Competencies Score</div>
                    </div>
                    {selectedAppraisalTypeForCreation === "Year-End" && (
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{scores.finalScore.toFixed(1)}</div>
                        <div className="text-sm text-muted-foreground">Final Score</div>
                        <Badge className={cn("mt-1", getScoreColor(getRatingLabel(scores.finalScore)))}>
                          {getRatingLabel(scores.finalScore)}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {selectedAppraisalTypeForCreation === "Year-End" && (
                    <div className="mt-4 text-sm text-muted-foreground">
                      <p>Final Score Calculation: Goals (70%) + Competencies (30%)</p>
                      <p>
                        ({scores.goalScore.toFixed(1)} × 0.7) + ({scores.competencyScore.toFixed(1)} × 0.3) = {scores.finalScore.toFixed(1)}
                      </p>
                    </div>
                  )}
                </Card>

                {/* Digital Signature */}
                <Card className="p-6">
                  <h4 className="font-semibold mb-4">Digital Signature</h4>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="appraiser-name" className="text-sm font-medium">Appraiser Name</label>
                      <Input
                        id="appraiser-name"
                        value={appraiserName}
                        onChange={(e) => setAppraiserName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="digital-signature" className="text-sm font-medium">
                        Digital Signature *
                      </label>
                      <Input
                        id="digital-signature"
                        placeholder="Type your full name to sign digitally"
                        value={digitalSignature}
                        onChange={(e) => setDigitalSignature(e.target.value)}
                        className="mt-1"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      By typing your name above, you are providing your digital signature and confirming the accuracy of this appraisal.
                    </p>
                  </div>
                </Card>
              </div>
            )}
          </ScrollArea>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setWizardStep((prev) => Math.max(1, prev - 1))}
              disabled={wizardStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAppraisalWizard(false)}>
                Cancel
              </Button>
              
              {wizardStep < totalSteps ? (
                <Button onClick={() => setWizardStep((prev) => prev + 1)} className="flex items-center gap-2">
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={completeAppraisal}
                  className="flex items-center gap-2"
                  disabled={!digitalSignature.trim()}
                >
                  <Save className="w-4 h-4" />
                  Complete Appraisal
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Appraisals" }]}>
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <header className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{title}</h1>
                <p className="text-lg text-muted-foreground">Manage and review performance appraisals</p>
              </div>
              {(userRole === "Appraiser" || userRole === "HR") && (
                <Button
                  className="flex items-center gap-2 px-6 py-2 rounded-lg shadow-lg"
                  onClick={() => startAppraisalCreation("Mid-Year")}
                >
                  <Plus className="w-4 h-4" />
                  New Appraisal
                </Button>
              )}
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
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Appraisals" }]}>
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{title}</h1>
              <p className="text-lg text-muted-foreground">Manage and review performance appraisals</p>
              {userRole !== "HR" && (
                <Badge variant="outline" className="mt-2">
                  {userRole} View
                </Badge>
              )}
            </div>
            
            {/* Fixed New Appraisal Button */}
            {(userRole === "Appraiser" || userRole === "HR") && (
              <Dialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button
                        className="fixed z-40 top-6 right-6 sm:top-8 sm:right-8 bg-primary text-primary-foreground shadow-xl px-6 py-3 rounded-lg flex items-center gap-2 transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus:outline-none"
                        aria-label="Create New Appraisal"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">New Appraisal</span>
                      </Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="left" sideOffset={12}>
                    Create New Appraisal
                  </TooltipContent>
                </Tooltip>
                <DialogContent className="p-0 max-w-xs w-full rounded-2xl shadow-2xl border-0">
                  <div className="flex flex-col divide-y">
                    <button
                      className="flex items-center gap-3 px-8 py-6 text-lg font-semibold hover:bg-accent focus:bg-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-t-2xl"
                      onClick={() => startAppraisalCreation("Mid-Year")}
                      tabIndex={0}
                      aria-label="Create Mid-Year Appraisal"
                    >
                      <span className="inline-block bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center mr-2">
                        <Target className="w-6 h-6" />
                      </span>
                      Create Mid-Year Appraisal
                    </button>
                    <button
                      className="flex items-center gap-3 px-8 py-6 text-lg font-semibold hover:bg-accent focus:bg-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-b-2xl"
                      onClick={() => startAppraisalCreation("Year-End")}
                      tabIndex={0}
                      aria-label="Create Year-End Appraisal"
                    >
                      <span className="inline-block bg-yellow-100 text-yellow-600 rounded-full w-10 h-10 flex items-center justify-center mr-2">
                        <Star className="w-6 h-6" />
                      </span>
                      Create Year-End Appraisal
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
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
                    <Input
                      id="search"
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
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
                      {appraisalTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
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
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {selectedDepartments.includes("All")
                          ? "All Departments"
                          : selectedDepartments.length === 1
                          ? selectedDepartments[0]
                          : `${selectedDepartments.length} selected`}
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <div className="p-4 space-y-2">
                        {departments.map((dept) => (
                          <div key={dept} className="flex items-center space-x-2">
                            <Checkbox
                              id={`dept-${dept}`}
                              checked={selectedDepartments.includes(dept)}
                              onCheckedChange={(checked) => handleDepartmentChange(dept, !!checked)}
                            />
                            <label htmlFor={`dept-${dept}`} className="text-sm">{dept}</label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Division (conditional) */}
                {showDivision && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Division</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {selectedDivisions.includes("All")
                            ? "All Divisions"
                            : selectedDivisions.length === 1
                            ? selectedDivisions[0]
                            : `${selectedDivisions.length} selected`}
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <div className="p-4 space-y-2">
                          {divisions.map((div) => (
                            <div key={div} className="flex items-center space-x-2">
                              <Checkbox
                                id={`div-${div}`}
                                checked={selectedDivisions.includes(div)}
                                onCheckedChange={(checked) => handleDivisionChange(div, !!checked)}
                              />
                              <label htmlFor={`div-${div}`} className="text-sm">{div}</label>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-3 w-[150px]" />
                      </div>
                      <Skeleton className="h-6 w-[80px]" />
                      <Skeleton className="h-6 w-[60px]" />
                    </div>
                  ))}
                </div>
              ) : filteredAndSortedAppraisals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                    <SearchX className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">No reviews match your filters</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Try adjusting your search criteria or filters to find the appraisals you're looking for.
                  </p>
                  {(userRole === "Appraiser" || userRole === "HR") && (
                    <Button className="flex items-center gap-2" onClick={() => startAppraisalCreation("Mid-Year")}>
                      <Plus className="w-4 h-4" />
                      Create New Appraisal
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <ScrollArea className="h-[600px]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                        <TableRow>
                          <SortableHeader column="employeeName">Employee</SortableHeader>
                          <SortableHeader column="jobTitle">Job Title</SortableHeader>
                          <SortableHeader column="department">Department</SortableHeader>
                          {showDivision && <SortableHeader column="division">Division</SortableHeader>}
                          <SortableHeader column="appraisalType">Type</SortableHeader>
                          <SortableHeader column="score">Score</SortableHeader>
                          <TableHead>Label</TableHead>
                          <SortableHeader column="dateOfAppraisal">Year</SortableHeader>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {paginatedAppraisals.map((appraisal) => (
                            <motion.tr
                              key={appraisal.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="hover:bg-muted/50 transition-colors"
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={appraisal.employeeAvatar} alt={appraisal.employeeName} />
                                    <AvatarFallback>
                                      <User className="w-4 h-4" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">
                                    {appraisal.employeeName}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {appraisal.jobTitle}
                              </TableCell>
                              <TableCell>
                                {appraisal.department}
                              </TableCell>
                              {showDivision && (
                                <TableCell>
                                  {appraisal.division || "—"}
                                </TableCell>
                              )}
                              <TableCell>
                                {appraisal.appraisalType}
                              </TableCell>
                              <TableCell>
                                <span className="font-mono text-sm">
                                  {appraisal.score.toFixed(1)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge className={cn("text-xs", getScoreColor(appraisal.scoreLabel))}>
                                  {appraisal.scoreLabel}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(appraisal.dateOfAppraisal).getFullYear()}
                              </TableCell>
                              <TableCell>
                                <RowActions appraisal={appraisal} />
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </ScrollArea>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedAppraisals.length)} of {filteredAndSortedAppraisals.length} results
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = i + 1;
                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="w-8 h-8 p-0"
                              >
                                {page}
                              </Button>
                            );
                          })}
                          {totalPages > 5 && (
                            <>
                              <span className="text-muted-foreground">...</span>
                              <Button
                                variant={currentPage === totalPages ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(totalPages)}
                                className="w-8 h-8 p-0"
                              >
                                {totalPages}
                              </Button>
                            </>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Appraisal Creation Wizard */}
        <AppraisalWizard />
      </div>
    </DashboardLayout>
  );
}

export default AppraisalsPage;
