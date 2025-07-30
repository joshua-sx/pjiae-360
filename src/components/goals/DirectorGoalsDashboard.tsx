import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, User, AlertCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { MobileTable, MobileTableRow } from "@/components/ui/mobile-table";
import { goalColumns } from "./table/goal-columns";
import { cn } from "@/lib/utils";
import { useGoals, type Goal } from "@/hooks/useGoals";
import { usePermissions } from "@/hooks/usePermissions";
import { useDepartments } from "@/hooks/useDepartments";
import { YearFilter } from "@/components/shared/YearFilter";
import { EmptyState } from "@/components/ui/empty-state";
import { useMobileResponsive } from "@/hooks/use-mobile-responsive";

// Division Goal Card Component
function DivisionGoalCard() {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-1 h-6 bg-primary rounded-full flex-shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <h3 className="text-lg font-semibold text-foreground">2025 Division Goal</h3>
              <p className="text-muted-foreground leading-relaxed">
                Increase customer satisfaction scores by 25% through improved service delivery and enhanced product quality initiatives across all departments.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">Sarah Johnson</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">Division Director</span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            see full goal
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Goals Table for Directors
function DirectorGoalsTable({
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

interface DirectorGoalsDashboardProps {
  className?: string;
}

export function DirectorGoalsDashboard({ className }: DirectorGoalsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("All");
  const [yearFilter, setYearFilter] = useState<string>("All");
  const { isMobile } = useMobileResponsive();
  
  // Hooks
  const { roles, canManageGoals } = usePermissions();
  const { departments } = useDepartments();
  const { goals, loading, error, refetch } = useGoals({
    year: yearFilter === "All" ? undefined : yearFilter
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
      
      // For department filter, we would need to add department info to the goal data
      // For now, we'll just filter by department name in the search
      const matchesDepartment = departmentFilter === "All" || 
        goal.employeeName.toLowerCase().includes(departmentFilter.toLowerCase());
      
      return matchesSearch && matchesDepartment;
    });
  }, [goals, debouncedSearchTerm, departmentFilter]);

  const handleGoalClick = (goal: Goal) => {
    // Handle goal click - could navigate to goal detail page
    console.log("Goal clicked:", goal);
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
      {/* Division Goal Card */}
      <DivisionGoalCard />

      {/* Team Goals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Team Goals</h2>
            <p className="text-sm text-muted-foreground">Track and manage your team's progress</p>
          </div>
          {canManageGoals && (
            <Button asChild className="gap-2">
              <Link to="/goals/new">
                <Plus className="w-4 h-4" />
                Create Goal
              </Link>
            </Button>
          )}
        </div>

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
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className={isMobile ? "w-full" : "w-40"}>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <YearFilter
              value={yearFilter}
              onValueChange={setYearFilter}
              className={isMobile ? "w-full" : "w-40"}
            />
          </div>
        </div>

        {/* Goals Table */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </motion.div>
          ) : filteredGoals.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <EmptyState
                icon={Search}
                title="No team goals found"
                description={
                  debouncedSearchTerm.length > 0 || departmentFilter !== "All" || yearFilter !== "All"
                    ? "No goals match your current filters. Try adjusting your search or filters."
                    : "Start setting goals for your team members to drive performance."
                }
              >
                {canManageGoals && (
                  <Button asChild className="gap-2">
                    <Link to="/goals/new">
                      <Plus className="w-4 h-4" />
                      Create Goal
                    </Link>
                  </Button>
                )}
              </EmptyState>
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
                        <Badge variant="secondary" className="text-xs">
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
                        label="Job Title" 
                        value="Position" 
                      />
                    </Card>
                  )}
                  onItemClick={handleGoalClick}
                  emptyMessage="No goals found"
                />
              ) : (
                <DirectorGoalsTable
                  goals={filteredGoals}
                  onGoalClick={handleGoalClick}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}