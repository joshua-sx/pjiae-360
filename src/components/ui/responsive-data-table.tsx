import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { MobileCardView, EmployeeCard, GoalCard } from "@/components/ui/mobile-card-view";
import { useMobileResponsive } from "@/hooks/use-mobile-responsive";
import { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

interface ResponsiveDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
  mobileCardRenderer?: (item: T, index: number) => React.ReactNode;
  enablePagination?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableSelection?: boolean;
  enableHorizontalScroll?: boolean;
  searchKey?: string;
  searchPlaceholder?: string;
  className?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  loadingSkeleton?: React.ReactNode;
}

export function ResponsiveDataTable<T>({
  data,
  columns,
  onRowClick,
  mobileCardRenderer,
  enablePagination = true,
  enableSorting = true,
  enableFiltering = true,
  enableSelection = false,
  enableHorizontalScroll = false,
  searchKey,
  searchPlaceholder,
  className,
  emptyMessage,
  isLoading = false,
  loadingSkeleton
}: ResponsiveDataTableProps<T>) {
  const { isMobile } = useMobileResponsive();

  if (isMobile && mobileCardRenderer) {
    return (
      <MobileCardView
        data={data}
        renderCard={mobileCardRenderer}
        onItemClick={onRowClick}
        className={className}
        emptyMessage={emptyMessage}
        loading={isLoading}
        loadingSkeleton={loadingSkeleton}
      />
    );
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={onRowClick}
      enablePagination={enablePagination}
      enableSorting={enableSorting}
      enableFiltering={enableFiltering}
      enableSelection={enableSelection}
      enableHorizontalScroll={enableHorizontalScroll}
      searchKey={searchKey}
      searchPlaceholder={searchPlaceholder}
      className={cn("w-full max-w-full min-w-0", className)}
      isLoading={isLoading}
    />
  );
}

// Predefined responsive tables for common entities
interface ResponsiveEmployeeTableProps {
  employees: any[]; // Use any to accommodate different employee schemas
  columns: ColumnDef<any>[];
  onEmployeeClick?: (employee: any) => void;
  onEmployeeAction?: (employee: any) => void;
  className?: string;
  isLoading?: boolean;
}

export function ResponsiveEmployeeTable({
  employees,
  columns,
  onEmployeeClick,
  onEmployeeAction,
  className,
  isLoading = false
}: ResponsiveEmployeeTableProps) {
  const transformedEmployees = employees.map(emp => ({
    ...emp,
    name: emp.name || emp.profile?.first_name ? 
      `${emp.profile?.first_name || ''} ${emp.profile?.last_name || ''}`.trim() :
      emp.first_name ? `${emp.first_name || ''} ${emp.last_name || ''}`.trim() : 'Unknown',
    email: emp.email || emp.profile?.email || '',
    department: emp.department?.name || emp.department || '',
    position: emp.position || emp.job_title || ''
  }));

  return (
    <ResponsiveDataTable
      data={transformedEmployees}
      columns={columns}
      onRowClick={onEmployeeClick}
      enableHorizontalScroll={false}
      mobileCardRenderer={(employee, index) => (
        <EmployeeCard
          key={employee.id}
          employee={employee}
          onAction={onEmployeeAction}
        />
      )}
      searchKey="name"
      searchPlaceholder="Search employees..."
      className={className}
      emptyMessage="No employees found"
      isLoading={isLoading}
    />
  );
}

interface ResponsiveGoalTableProps {
  goals: Array<{
    id: string;
    title: string;
    employeeName?: string;
    status?: string;
    progress?: number;
    dueDate?: string;
    weight?: number;
  }>;
  columns: ColumnDef<any>[];
  onGoalClick?: (goal: any) => void;
  onGoalAction?: (goal: any) => void;
  className?: string;
  isLoading?: boolean;
}

export function ResponsiveGoalTable({
  goals,
  columns,
  onGoalClick,
  onGoalAction,
  className,
  isLoading = false
}: ResponsiveGoalTableProps) {
  return (
    <ResponsiveDataTable
      data={goals}
      columns={columns}
      onRowClick={onGoalClick}
      mobileCardRenderer={(goal, index) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onAction={onGoalAction}
        />
      )}
      searchKey="title"
      searchPlaceholder="Search goals..."
      className={className}
      emptyMessage="No goals found"
      isLoading={isLoading}
    />
  );
}