
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, ChevronDown, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { goalColumns } from "./table/goal-columns";
import { cn } from "@/lib/utils";
import { Goal, DivisionGoal } from './types';
import { defaultDivisionGoal, defaultGoals } from './mockData';
import { useEmployees } from "@/hooks/useEmployees";

// Status color mapping
const getStatusColor = (status: Goal["status"]) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "In Progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "At Risk":
      return "bg-red-100 text-red-800 border-red-200";
    case "Not Started":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Division Goal Callout Component
function DivisionGoalCallout({ goal }: { goal: DivisionGoal }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fullGoalDescription = "Increase customer satisfaction scores by 25% through improved service delivery and enhanced product quality initiatives across all departments. This involves deploying a new customer feedback system to gather real-time insights, redesigning our onboarding process for better initial engagement, and establishing a dedicated tier-2 support team for complex issue resolution. We will also conduct quarterly workshops for all client-facing staff to ensure consistent service standards and product knowledge. Key performance indicators will include Net Promoter Score (NPS), Customer Satisfaction (CSAT), and average ticket resolution time. The ultimate aim is to foster long-term customer loyalty and establish our brand as a leader in customer-centric service, creating a sustainable competitive advantage in the market.";

  return (
    <>
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-2 h-8 bg-primary rounded-full" />
            {goal.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-lg leading-relaxed">
            {goal.description}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="block text-xs font-light text-muted-foreground mt-1 transition-colors underline-offset-2 hover:underline hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded-sm"
            style={{ letterSpacing: '0.01em' }}
          >
            see full goal
          </button>
          <div className="flex items-center gap-3 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{goal.director}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{goal.directorTitle}</span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{goal.title}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-4">
            <p className="text-muted-foreground leading-relaxed">{fullGoalDescription}</p>
          </div>
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
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
      enablePagination={false}
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
function EmptyState({
  isSearching,
  searchTerm
}: {
  isSearching: boolean;
  searchTerm: string;
}) {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
        <Search className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {isSearching ? "No goals found" : "No goals yet"}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {isSearching 
          ? `No goals match "${searchTerm}". Try adjusting your search or filters.`
          : "Get started by creating your first goal for the team."
        }
      </p>
      {!isSearching && (
        <Button asChild className="gap-2">
          <Link to="/goals/new">
            <Plus className="w-4 h-4" />
            Create First Goal
          </Link>
        </Button>
      )}
    </div>
  );
}

interface ManagerGoalsDashboardProps {
  divisionGoal?: DivisionGoal;
  goals?: Goal[];
  isLoading?: boolean;
}

export function ManagerGoalsDashboard({
  divisionGoal = defaultDivisionGoal,
  goals = defaultGoals,
  isLoading = false
}: ManagerGoalsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState("employee");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { data: employees } = useEmployees();

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter and sort goals
  const filteredAndSortedGoals = useMemo(() => {
    let filtered = goals.filter(goal => {
      const matchesSearch = 
        goal.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        goal.employee.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || goal.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      if (sortBy === 'role') {
        const getRole = (name: string) => employees?.find(e => `${e.first_name} ${e.last_name}` === name)?.role?.name || '';
        aValue = getRole(a.employee);
        bValue = getRole(b.employee);
      } else {
        aValue = a[sortBy as keyof Goal];
        bValue = b[sortBy as keyof Goal];
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [goals, debouncedSearchTerm, statusFilter, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Division Goal Callout */}
      <DivisionGoalCallout goal={divisionGoal} />

      {/* Goals Section */}
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Team Goals</h2>
            <p className="text-muted-foreground">Track and manage your team's progress</p>
          </div>
          <Button asChild className="gap-2">
            <Link to="/goals/new">
              <Plus className="w-4 h-4" />
              Create Goal
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search goals or employees..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="At Risk">At Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Goals Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSkeleton />
            </motion.div>
          ) : filteredAndSortedGoals.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <EmptyState
                isSearching={debouncedSearchTerm.length > 0 || statusFilter !== "All"}
                searchTerm={debouncedSearchTerm}
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
          <GoalsTable
            goals={filteredAndSortedGoals}
            onGoalClick={handleGoalClick}
          />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Goal Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {selectedGoal?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedGoal && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Badge className={cn("text-sm", getStatusColor(selectedGoal.status))}>
                  {selectedGoal.status}
                </Badge>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{selectedGoal.employee}</span>
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
