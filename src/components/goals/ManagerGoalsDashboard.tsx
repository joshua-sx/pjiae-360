import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, ChevronDown, User, AlertCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { MobileTable, MobileTableRow } from "@/components/ui/mobile-table";
import { goalColumns } from "./table/goal-columns";
import { cn } from "@/lib/utils";
import { useGoals, type Goal } from "@/hooks/useGoals";
import { usePermissions } from "@/hooks/usePermissions";
import { YearFilter } from "@/components/shared/YearFilter";
import { EmptyState } from "@/components/ui/empty-state";
import { useMobileResponsive } from "@/hooks/use-mobile-responsive";

// Status color mapping
const getStatusColor = (status: Goal["status"]) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "active":
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
      title: "No goals found",
      description: `No goals match "${searchTerm}". Try adjusting your search or filters.`,
      showCreateButton: false
    };
  }

  if (roles.includes('employee') && !roles.some(r => ['admin', 'director', 'manager', 'supervisor'].includes(r))) {
    return {
      title: "No goals assigned yet",
      description: "You don't have any goals assigned for this period. Check with your manager for upcoming goal assignments.",
      showCreateButton: false
    };
  } else if (roles.includes('manager') || roles.includes('supervisor')) {
    return {
      title: "No team goals yet",
      description: "Get started by creating goals for your team members.",
      showCreateButton: true
    };
  } else if (roles.includes('director')) {
    return {
      title: "No division goals yet",
      description: "Start setting goals for your division to drive performance.",
      showCreateButton: true
    };
  } else {
    return {
      title: "No goals in the system",
      description: "Get started by creating the first goals for your organization.",
      showCreateButton: true
    };
  }
}

// Enhanced Goals Table using TanStack Table
function GoalsTable({
  goals,
  onGoalClick,
}: {
  goals: Goal[];
  onGoalClick: (goal: Goal) => void;
}) {
  return (
    <DataTable
      columns={goalColumns}
      data={goals}
      onRowClick={onGoalClick}
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
function GoalsEmptyState({
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
          onClick={() => window.location.href = "/goals/new"}
        >
          <Plus className="w-4 h-4" />
          Create Goal
        </Button>
      )}
    </EmptyState>
  );
}

interface ManagerGoalsDashboardProps {
  className?: string;
}

export function ManagerGoalsDashboard({ className }: ManagerGoalsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [yearFilter, setYearFilter] = useState<string>("All");
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { isMobile } = useMobileResponsive();
  
  // Hooks
  const { roles, canManageGoals } = usePermissions();
  const { goals, loading, error, refetch } = useGoals({
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

  // Filter goals
  const filteredGoals = useMemo(() => {
    return goals.filter(goal => {
      const matchesSearch = 
        goal.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        goal.employeeName.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || goal.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [goals, debouncedSearchTerm, statusFilter]);

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDetailModalOpen(true);
  };

  if (error) {
    return (
      <div className={cn("space-y-6", className)}>
        <EmptyState
          icon={AlertCircle}
          title="Error loading goals"
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
            placeholder="Search goals or employees..."
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
              <SelectItem value="active">Active</SelectItem>
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

      {/* Goals Content */}
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
        ) : filteredGoals.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GoalsEmptyState
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
                data={filteredGoals}
                renderCard={(goal) => (
                  <Card key={goal.id} className="p-4 space-y-3 cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{goal.title}</div>
                      <Badge className={cn("text-xs", getStatusColor(goal.status))}>
                        {goal.status}
                      </Badge>
                    </div>
                    
                    <MobileTableRow 
                      label="Employee" 
                      value={
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{goal.employeeName}</span>
                        </div>
                      } 
                    />
                    
                    <MobileTableRow 
                      label="Type" 
                      value={goal.type} 
                    />
                    
                    <MobileTableRow 
                      label="Weight" 
                      value={`${goal.weight}%`} 
                    />
                    
                    <MobileTableRow 
                      label="Due Date" 
                      value={goal.dueDate ? new Date(goal.dueDate).toLocaleDateString() : 'No due date'} 
                    />
                    
                    {goal.description && (
                      <MobileTableRow 
                        label="Description" 
                        value={<span className="text-sm text-muted-foreground line-clamp-2">{goal.description}</span>} 
                      />
                    )}
                  </Card>
                )}
                onItemClick={handleGoalClick}
                emptyMessage="No goals found"
              />
            ) : (
              <GoalsTable
                goals={filteredGoals}
                onGoalClick={handleGoalClick}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className={isMobile ? "max-w-[95vw] max-h-[90vh] overflow-y-auto" : "max-w-2xl"}>
          <DialogHeader>
            <DialogTitle className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}>
              {selectedGoal?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedGoal && (
            <div className="space-y-6">
              <div className={`flex gap-4 ${isMobile ? 'flex-col' : 'items-center'}`}>
                <Badge className={cn("text-sm w-fit", getStatusColor(selectedGoal.status))}>
                  {selectedGoal.status}
                </Badge>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{selectedGoal.employeeName}</span>
                </div>
              </div>

              {selectedGoal.description && (
                <div className="space-y-2">
                  <h4 className="font-medium">Description</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedGoal.description}
                  </p>
                </div>
              )}

              <div className={`grid gap-4 text-sm ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div>
                  <span className="font-medium">Type:</span> {selectedGoal.type}
                </div>
                <div>
                  <span className="font-medium">Weight:</span> {selectedGoal.weight}
                </div>
                <div>
                  <span className="font-medium">Year:</span> {selectedGoal.year}
                </div>
                <div>
                  <span className="font-medium">Due Date:</span> {selectedGoal.dueDate ? new Date(selectedGoal.dueDate).toLocaleDateString() : 'No due date'}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
