"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Plus, RefreshCw, FileText, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { createAppraisalColumns } from "@/features/appraisals/components/table";
import { Skeleton } from "@/components/ui/skeleton";

import { useAppraisals } from "@/features/appraisals";
import type { Appraisal } from "@/features/appraisals";
import { usePermissions } from "@/features/access-control";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMobileResponsive } from "@/hooks/use-mobile-responsive";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [yearFilter, setYearFilter] = useState("All");
  
  // Hooks
  const { roles, canCreateAppraisals } = usePermissions();
  const { data: appraisals, isLoading: loading, error, refetch } = useAppraisals({
    year: yearFilter,
    status: statusFilter === "All" ? undefined : statusFilter,
  });
  
  // Appraisal creation wizard
  const [showWizard, setShowWizard] = useState(false);

  const startAppraisalCreation = useCallback(() => {
    setShowWizard(true);
  }, []);

  // Filter appraisals
  const filteredAppraisals = useMemo(() => {
    return appraisals.filter(appraisal => {
      const matchesSearch = searchTerm === "" || 
        appraisal.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appraisal.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appraisal.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [appraisals, searchTerm]);

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
      >
        {emptyState.showCreateButton && (
          <Button onClick={startAppraisalCreation} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Appraisal
          </Button>
        )}
      </EmptyState>
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

  if (error) {
    return (
      <div className={cn("space-y-6", className)}>
        <EmptyState
          icon={AlertCircle}
          title="Error loading appraisals"
          description={error}
        >
          <Button onClick={refetch} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Content */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-4 w-20" />
                    ))}
                  </div>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ) : filteredAppraisals.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                <AppraisalsEmptyState
                  isSearching={searchTerm.length > 0 || statusFilter !== "All" || yearFilter !== "All"}
                  searchTerm={searchTerm}
                  roles={roles}
                />
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-1 items-center space-x-2">
                      <input
                        placeholder="Search appraisals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-8 w-[150px] lg:w-[250px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      />
                      
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] h-8">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Statuses</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={yearFilter} onValueChange={setYearFilter}>
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Years</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <DataTable
                  columns={createAppraisalColumns()}
                  data={filteredAppraisals}
                  enableSorting={true}
                  enableFiltering={false}
                  enablePagination={true}
                  enableSelection={true}
                  className="border-0"
                />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Appraisal Wizard */}
      <AppraisalWizard />
    </div>
  );
}