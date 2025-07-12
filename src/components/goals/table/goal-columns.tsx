import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Goal } from "../types";

const getStatusColor = (status: Goal["status"]) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800 hover:bg-green-100/80";
    case "In Progress":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
    case "At Risk":
      return "bg-orange-100 text-orange-800 hover:bg-orange-100/80";
    case "Not Started":
      return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
  }
};

export const goalColumns: ColumnDef<Goal>[] = [
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
      <div className="space-y-1">
        <div className="font-medium">{row.getValue("title")}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.employee}
        </div>
      </div>
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
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "progress",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium"
      >
        Progress
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const progress = row.getValue("progress") as number;
      return (
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-medium">{progress}%</span>
        </div>
      );
    },
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
      const dueDate = row.getValue("dueDate") as string;
      return (
        <div className="text-sm">
          {new Date(dueDate).toLocaleDateString()}
        </div>
      );
    },
  },
  {
    accessorKey: "employee",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium"
      >
        Employee
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const employee = row.getValue("employee") as string;
      return <div className="text-sm">{employee}</div>;
    },
  },
];