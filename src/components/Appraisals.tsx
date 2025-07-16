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
import { useAppraisals, type Appraisal } from "@/hooks/useAppraisals";
import { usePermissions } from "@/hooks/usePermissions";
import { YearFilter } from "@/components/shared/YearFilter";
import { EmptyState } from "@/components/ui/empty-state";
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
interface AppraisalsPageProps {
  title?: string;
  className?: string;
}

// Role-based empty states
function getRoleBasedEmptyState(roles: string[], isSearching: boolean, searchTerm: string) {
  if (isSearching) {
    return {
      title: "No appraisals found",
      description: `No appraisals match "${searchTerm}". Try adjusting your search or filters.`,
      showCreateButton: false
    };
  }

  if (roles.includes('employee') && !roles.some(r => ['admin', 'director', 'manager', 'supervisor'].includes(r))) {
    return {
      title: "No appraisals yet",
      description: "Your appraisals will appear here once they are created by your manager.",
      showCreateButton: false
    };
  } else if (roles.includes('manager') || roles.includes('supervisor')) {
    return {
      title: "No team appraisals yet",
      description: "Start conducting appraisals for your team members.",
      showCreateButton: true
    };
  } else if (roles.includes('director')) {
    return {
      title: "No division appraisals yet",
      description: "Appraisals for your division will appear here once created.",
      showCreateButton: true
    };
  } else {
    return {
      title: "No appraisals in the system",
      description: "Get started by creating the first appraisals for your organization.",
      showCreateButton: true
    };
  }
}

export default function AppraisalsPage({
  title = "Appraisals",
  className
}: AppraisalsPageProps) {
  const navigate = useNavigate();
  
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  
  // Hooks
  const { roles, canCreateAppraisals } = usePermissions();
  const { appraisals, loading, error, refetch } = useAppraisals({
    year: yearFilter,
    status: statusFilter === "All" ? undefined : statusFilter,
    type: typeFilter === "All" ? undefined : typeFilter
  });
  
  // Appraisal creation wizard
  const [showWizard, setShowWizard] = useState(false);

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const startAppraisalCreation = useCallback(() => {
    setShowWizard(true);
  }, []);

  // Filter appraisals
  const filteredAppraisals = useMemo(() => {
    return appraisals.filter(appraisal => {
      const matchesSearch = appraisal.employeeName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           appraisal.appraiser.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "All" || appraisal.status === statusFilter;
      const matchesType = typeFilter === "All" || appraisal.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [appraisals, debouncedSearchTerm, statusFilter, typeFilter]);

  // Empty state component
  function AppraisalsEmptyState({
    isSearching,
    searchTerm,
    roles
  }: {
    isSearching: boolean;
    searchTerm: string;
    roles: string[];
  }) {
    const emptyState = getRoleBasedEmptyState(roles, isSearching, searchTerm);
    
    return (
      <EmptyState
        icon={FileText}
        title={emptyState.title}
        description={emptyState.description}
        action={emptyState.showCreateButton ? (
          <Button onClick={startAppraisalCreation} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Appraisal
          </Button>
        ) : undefined}
      />
    );
  }

  if (error) {
    return (
      <div className={cn("space-y-6", className)}>
        <EmptyState
          icon={AlertCircle}
          title="Error loading appraisals"
          description={error}
          action={
            <Button onClick={refetch} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          }
        />
      </div>
    );
  }

  const AppraisalWizard = () => (
    <Dialog open={showWizard} onOpenChange={setShowWizard}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Appraisal</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <p className="text-muted-foreground">
            Appraisal creation wizard will be implemented here.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
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
