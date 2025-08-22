import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { 
  BarChart3, 
  Users, 
  Target, 
  ClipboardList, 
  FileText, 
  Search,
  Calendar,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useGoals } from "@/features/goal-management/hooks/useGoals";
import { useAppraisals } from "@/features/appraisals/hooks/useAppraisals";
import { useHotkeys } from "react-hotkeys-hook";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommandPalette = ({ open, onOpenChange }: CommandPaletteProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Data hooks
  const { data: employees } = useEmployees();
  const { goals } = useGoals();
  const { data: appraisals } = useAppraisals();

  // Keyboard shortcut
  useHotkeys("mod+k", (event) => {
    event.preventDefault();
    onOpenChange(!open);
  });

  useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  const navigationItems = [
    {
      id: "team-goals",
      title: "Team Goals",
      description: "View and manage your team's goals",
      icon: Target,
      href: "/manager/goals",
    },
    {
      id: "team-appraisals",
      title: "Team Appraisals",
      description: "Review team performance appraisals",
      icon: ClipboardList,
      href: "/manager/appraisals",
    },
    {
      id: "reports",
      title: "Reports",
      description: "Access detailed reports",
      icon: FileText,
      href: "/admin/reports",
    },
    {
      id: "employees",
      title: "Employees",
      description: "Manage team members",
      icon: Users,
      href: "/admin/employees",
    },
  ];

  const quickFilters = [
    {
      id: "overdue-goals",
      title: "Overdue Goals",
      description: "Goals that are past their due date",
      icon: AlertCircle,
      action: () => navigate("/manager/goals?filter=overdue"),
    },
    {
      id: "at-risk-goals",
      title: "At Risk Goals",
      description: "Goals that may not be completed on time",
      icon: TrendingUp,
      action: () => navigate("/manager/goals?filter=at-risk"),
    },
    {
      id: "due-this-quarter",
      title: "Due This Quarter",
      description: "Goals due in the current quarter",
      icon: Calendar,
      action: () => navigate("/manager/goals?filter=this-quarter"),
    },
  ];

  // Filter data based on search term
  const filteredEmployees = employees?.filter(employee =>
    `${employee.profile?.first_name} ${employee.profile?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredGoals = goals?.filter(goal =>
    goal.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    goal.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredAppraisals = appraisals?.filter(appraisal =>
    appraisal.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleItemSelect = (callback: () => void) => {
    callback();
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Command Palette</DialogTitle>
      <DialogDescription className="sr-only">
        Search for navigation items, employees, goals, and appraisals
      </DialogDescription>
      <Command>
        <CommandInput
          placeholder="Search for pages, people, goals, or appraisals..."
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {/* Navigation */}
          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => handleItemSelect(() => navigate(item.href))}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <div>
                  <div>{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>

          {/* Quick Filters */}
          <CommandGroup heading="Quick Filters">
            {quickFilters.map((filter) => (
              <CommandItem
                key={filter.id}
                onSelect={() => handleItemSelect(filter.action)}
              >
                <filter.icon className="mr-2 h-4 w-4" />
                <div>
                  <div>{filter.title}</div>
                  <div className="text-xs text-muted-foreground">{filter.description}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>

          {/* Employees */}
          {searchTerm && filteredEmployees.length > 0 && (
            <CommandGroup heading="Employees">
              {filteredEmployees.slice(0, 5).map((employee) => (
                <CommandItem
                  key={employee.id}
                  onSelect={() => handleItemSelect(() => navigate(`/admin/employees/${employee.id}`))}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <div>
                    <div>{employee.profile?.first_name} {employee.profile?.last_name}</div>
                    <div className="text-xs text-muted-foreground">{employee.profile?.email}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Goals */}
          {searchTerm && filteredGoals.length > 0 && (
            <CommandGroup heading="Goals">
              {filteredGoals.slice(0, 5).map((goal) => (
                <CommandItem
                  key={goal.id}
                  onSelect={() => handleItemSelect(() => navigate(`/manager/goals/${goal.id}`))}
                >
                  <Target className="mr-2 h-4 w-4" />
                  <div>
                    <div>{goal.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {goal.employeeName} • {goal.status}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Appraisals */}
          {searchTerm && filteredAppraisals.length > 0 && (
            <CommandGroup heading="Appraisals">
              {filteredAppraisals.slice(0, 5).map((appraisal) => (
                <CommandItem
                  key={appraisal.id}
                  onSelect={() => handleItemSelect(() => navigate(`/manager/appraisals/${appraisal.id}`))}
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  <div>
                    <div>{appraisal.employeeName}</div>
                    <div className="text-xs text-muted-foreground">
                      {appraisal.employeeName} • {appraisal.status}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
};