"use client";

import * as React from "react";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Plus, Search, Filter, Eye, Edit, Download, ChevronDown, RefreshCw, FileText, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { createAppraisalColumns } from "./appraisals/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppraisals } from "@/hooks/useAppraisals";
import type { Appraisal } from "@/hooks/useAppraisals";
import { usePermissions } from "@/hooks/usePermissions";
import { YearFilter } from "@/components/shared/YearFilter";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track employee performance appraisals
          </p>
        </div>
        {canCreateAppraisals && (
          <Button onClick={startAppraisalCreation} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Appraisal
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search employees or appraisers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="min-w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="min-w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>

          {/* Year Filter */}
          <YearFilter
            value={yearFilter}
            onValueChange={setYearFilter}
            className="min-w-[120px]"
          />
        </div>
      </Card>

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
                  isSearching={debouncedSearchTerm.length > 0 || statusFilter !== "All" || typeFilter !== "All" || yearFilter !== "All"}
                  searchTerm={debouncedSearchTerm}
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
                <DataTable
                  columns={createAppraisalColumns()}
                  data={filteredAppraisals}
                  enableSorting={true}
                  enableFiltering={false}
                  enablePagination={true}
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