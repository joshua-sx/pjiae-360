import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Goal } from "@/hooks/useGoals";
import { usePermissions } from "@/hooks/usePermissions";

const getStatusColor = (status: Goal["status"]) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 hover:bg-green-100/80";
    case "active":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
    case "cancelled":
      return "bg-red-100 text-red-800 hover:bg-red-100/80";
    case "draft":
      return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
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
    accessorKey: "employeeName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium"
      >
        Employee Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("employeeName")}</div>
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium"
      >
        Goal Title
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium"
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as Goal["status"];
      return (
        <Badge variant="secondary" className={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "year",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium"
      >
        Year
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("year")}</div>
    ),
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium"
      >
        Due Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const dueDate = row.getValue("dueDate") as string | null;
      return (
        <div className="text-sm">
          {dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date'}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <RowActions goal={row.original} />,
    enableSorting: false,
  },
];