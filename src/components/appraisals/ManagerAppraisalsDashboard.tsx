import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, User, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { MobileTable, MobileTableRow } from "@/components/ui/mobile-table";
import { createAppraisalColumns } from "./table/appraisal-columns";
import { cn } from "@/lib/utils";
import { useAppraisals, type Appraisal } from "@/hooks/useAppraisals";
import { usePermissions } from "@/hooks/usePermissions";
import { YearFilter } from "@/components/shared/YearFilter";
import { EmptyState } from "@/components/ui/empty-state";
import { useMobileResponsive } from "@/hooks/use-mobile-responsive";

// Status color mapping
const getStatusColor = (status: Appraisal["status"]) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "in_progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "draft":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

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
      description: "You don't have any appraisals for this period. Check with your manager for upcoming performance reviews.",
      showCreateButton: false
    };
  } else if (roles.includes('manager') || roles.includes('supervisor')) {
    return {
      title: "No team appraisals yet",
      description: "Get started by creating appraisals for your team members.",
      showCreateButton: true
    };
  } else if (roles.includes('director')) {
    return {
      title: "No division appraisals yet",
      description: "Start conducting appraisals for your division to track performance.",
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

// Enhanced Appraisals Table using TanStack Table
function AppraisalsTable({
  appraisals,
  onAppraisalClick,
}: {
  appraisals: Appraisal[];
  onAppraisalClick: (appraisal: Appraisal) => void;
}) {
  return (
    <DataTable
      columns={createAppraisalColumns()}
      data={appraisals}
      onRowClick={onAppraisalClick}
      enableHorizontalScroll={true}
      enableSorting={true}
      enableFiltering={false}
      enablePagination={true}
      className="w-full"
    />
  );
}

// Loading Skeleton Component
function LoadingSkeleton() {
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <div className="p-4 border-b border-border bg-muted/50">
        <div className="flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-4 border-b border-border last:border-b-0">
          <div className="flex gap-4 items-center">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty State Component
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
      icon={Search}
      title={emptyState.title}
      description={emptyState.description}
    >
      {emptyState.showCreateButton && (
        <Button 
          className="gap-2" 
          onClick={() => window.location.href = "/appraisals/new"}
        >
          <Plus className="w-4 h-4" />
          Create Appraisal
        </Button>
      )}
    </EmptyState>
  );
}

interface ManagerAppraisalsDashboardProps {
  className?: string;
}

export function ManagerAppraisalsDashboard({ className }: ManagerAppraisalsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [yearFilter, setYearFilter] = useState<string>("All");
  const [selectedAppraisal, setSelectedAppraisal] = useState<Appraisal | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { isMobile } = useMobileResponsive();
  
  // Hooks
  const { roles, canCreateAppraisals } = usePermissions();
  const { appraisals, loading, error, refetch } = useAppraisals({
    year: yearFilter,
    status: statusFilter === "All" ? undefined : statusFilter
  });

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter appraisals
  const filteredAppraisals = useMemo(() => {
    return appraisals.filter(appraisal => {
      const matchesSearch = 
        appraisal.employeeName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        appraisal.department.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        appraisal.appraiser.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || appraisal.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [appraisals, debouncedSearchTerm, statusFilter]);

  const handleAppraisalClick = (appraisal: Appraisal) => {
    setSelectedAppraisal(appraisal);
    setIsDetailModalOpen(true);
  };

  if (error) {
    return (
      <div className={cn("space-y-6", className)}>
        <EmptyState
          icon={AlertCircle}
          title="Error loading appraisals"
          description={error}
        >
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search and Filters */}
      <div className={`flex gap-4 items-start ${isMobile ? 'flex-col' : 'flex-col sm:flex-row sm:items-center'}`}>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search appraisals or employees..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className={`flex gap-4 ${isMobile ? 'flex-col w-full' : 'flex-row'}`}>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className={isMobile ? "w-full" : "w-40"}>
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

          <YearFilter
            value={yearFilter}
            onValueChange={setYearFilter}
            className={isMobile ? "w-full" : "w-40"}
          />
        </div>
      </div>

      {/* Appraisals Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingSkeleton />
          </motion.div>
        ) : filteredAppraisals.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AppraisalsEmptyState
              isSearching={debouncedSearchTerm.length > 0 || statusFilter !== "All" || yearFilter !== "All"}
              searchTerm={debouncedSearchTerm}
              roles={roles}
            />
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {isMobile ? (
              <MobileTable
                data={filteredAppraisals}
                renderCard={(appraisal) => (
                  <Card key={appraisal.id} className="p-4 space-y-3 cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{appraisal.employeeName}</div>
                      <Badge className={cn("text-xs", getStatusColor(appraisal.status))}>
                        {appraisal.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <MobileTableRow 
                      label="Department" 
                      value={appraisal.department}
                    />
                    
                    <MobileTableRow 
                      label="Type" 
                      value={appraisal.type} 
                    />
                    
                    <MobileTableRow 
                      label="Score" 
                      value={appraisal.score ? appraisal.score.toString() : 'Not Rated'} 
                    />
                    
                    <MobileTableRow 
                      label="Performance" 
                      value={appraisal.performance} 
                    />
                    
                    <MobileTableRow 
                      label="Appraiser" 
                      value={
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{appraisal.appraiser}</span>
                        </div>
                      } 
                    />
                  </Card>
                )}
                onItemClick={handleAppraisalClick}
                emptyMessage="No appraisals found"
              />
            ) : (
              <AppraisalsTable
                appraisals={filteredAppraisals}
                onAppraisalClick={handleAppraisalClick}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Appraisal Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className={isMobile ? "max-w-[95vw] max-h-[90vh] overflow-y-auto" : "max-w-2xl"}>
          <DialogHeader>
            <DialogTitle className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}>
              {selectedAppraisal?.employeeName} - Performance Appraisal
            </DialogTitle>
          </DialogHeader>
          {selectedAppraisal && (
            <div className="space-y-6">
              <div className={`flex gap-4 ${isMobile ? 'flex-col' : 'items-center'}`}>
                <Badge className={cn("text-sm w-fit", getStatusColor(selectedAppraisal.status))}>
                  {selectedAppraisal.status.replace('_', ' ')}
                </Badge>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>Appraiser: {selectedAppraisal.appraiser}</span>
                </div>
              </div>

              <div className={`grid gap-4 text-sm ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div>
                  <span className="font-medium">Department:</span> {selectedAppraisal.department}
                </div>
                <div>
                  <span className="font-medium">Job Title:</span> {selectedAppraisal.jobTitle}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {selectedAppraisal.type}
                </div>
                <div>
                  <span className="font-medium">Score:</span> {selectedAppraisal.score || 'Not Rated'}
                </div>
                <div>
                  <span className="font-medium">Performance:</span> {selectedAppraisal.performance}
                </div>
                <div>
                  <span className="font-medium">Year:</span> {selectedAppraisal.year}
                </div>
              </div>

              {selectedAppraisal.cycleName && (
                <div className="text-sm">
                  <span className="font-medium">Cycle:</span> {selectedAppraisal.cycleName}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}