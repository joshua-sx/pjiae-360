import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreVertical, Eye, Edit, Trash2, User, Calendar, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import type { Goal } from "@/hooks/useGoals";
import { usePermissions } from "@/hooks/usePermissions";

const getStatusColor = (status: Goal["status"]) => {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "active":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    case "draft":
      return "bg-gray-50 text-gray-700 border-gray-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const getStatusLabel = (status: Goal["status"]) => {
  switch (status) {
    case "completed":
      return "Completed";
    case "active":
      return "Active";
    case "cancelled":
      return "Cancelled";
    case "draft":
      return "Draft";
    default:
      return status;
  }
};

const RowActions = ({ goal }: { goal: Goal }) => {
  const { canManageGoals } = usePermissions();
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="table-action-btn">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0 z-50 bg-background border shadow-md" align="end">
        <div className="py-1">
          <Button variant="ghost" size="sm" className="w-full justify-start px-3 py-2">
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          {canManageGoals && (
            <>
              <Button variant="ghost" size="sm" className="w-full justify-start px-3 py-2">
                <Edit className="w-4 h-4 mr-2" />
                Edit Goal
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start px-3 py-2 text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Goal
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const goalColumns: ColumnDef<Goal>[] = [
  {
    id: "employeeName",
    accessorKey: "employeeName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Employee Name" />
    ),
    cell: ({ row }) => (
      <div className="font-medium truncate max-w-[150px]">{row.getValue("employeeName")}</div>
    ),
    meta: {
      label: "Employee Name",
      placeholder: "Search employees...",
      variant: "text",
      icon: User,
    },
    enableColumnFilter: true,
    enableSorting: true,
    size: 150,
    minSize: 120,
    maxSize: 200,
  },
  {
    id: "title",
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Goal Title" />
    ),
    cell: ({ row }) => (
      <div className="font-medium truncate max-w-[200px]" title={row.getValue("title") as string}>
        {row.getValue("title")}
      </div>
    ),
    meta: {
      label: "Goal Title",
      placeholder: "Search goal titles...",
      variant: "text",
      icon: Target,
    },
    enableColumnFilter: true,
    enableSorting: true,
    size: 200,
    minSize: 150,
    maxSize: 300,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as Goal["status"];
      return (
        <Badge variant="secondary" className={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Badge>
      );
    },
    meta: {
      label: "Status",
      variant: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
        { label: "Draft", value: "draft" },
      ],
    },
    enableColumnFilter: true,
    enableSorting: true,
    size: 100,
    minSize: 80,
    maxSize: 120,
  },
  {
    id: "weight",
    accessorKey: "weight",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Weight" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("weight")}%</div>
    ),
    enableSorting: true,
    size: 80,
    minSize: 60,
    maxSize: 100,
  },
  {
    id: "progress",
    accessorKey: "progress",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Progress" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("progress")}%</div>
    ),
    enableSorting: true,
    size: 100,
    minSize: 80,
    maxSize: 120,
  },
  {
    id: "year",
    accessorKey: "year",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Year" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("year")}</div>
    ),
    meta: {
      label: "Year",
      variant: "select",
      options: [
        { label: "2025", value: "2025" },
        { label: "2024", value: "2024" },
        { label: "2023", value: "2023" },
      ],
    },
    enableColumnFilter: true,
    enableSorting: true,
    size: 80,
    minSize: 60,
    maxSize: 100,
  },
  {
    id: "dueDate",
    accessorKey: "dueDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due Date" />
    ),
    cell: ({ row }) => {
      const dueDate = row.getValue("dueDate") as string | null;
      return (
        <div className="text-sm">
          {dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date'}
        </div>
      );
    },
    meta: {
      label: "Due Date",
      placeholder: "Filter by due date...",
      variant: "date",
      icon: Calendar,
    },
    enableColumnFilter: true,
    enableSorting: true,
    size: 120,
    minSize: 100,
    maxSize: 150,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <RowActions goal={row.original} />,
    enableSorting: false,
    size: 80,
    minSize: 60,
    maxSize: 100,
  },
];