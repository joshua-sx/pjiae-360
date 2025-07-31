import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreVertical, Eye, Edit, Download, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import type { Appraisal } from "@/hooks/useAppraisals";

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 hover:bg-green-100/80";
    case "in_progress":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
    case "draft":
      return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
    case "cancelled":
      return "bg-red-100 text-red-800 hover:bg-red-100/80";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
  }
};

const getScoreColor = (label: string) => {
  switch (label) {
    case "Outstanding":
      return "bg-green-100 text-green-800 border-green-200";
    case "Exceeds Expectations":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Meets Expectations":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Needs Improvement":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Unsatisfactory":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

interface RowActionsProps {
  appraisal: Appraisal;
}

const RowActions = ({ appraisal }: RowActionsProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="sm" className="table-action-btn">
        <MoreVertical className="w-4 h-4" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-48 p-0" align="end">
      <div className="py-1">
        <Button variant="ghost" size="sm" className="w-full justify-start px-3 py-2">
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start px-3 py-2">
          <Edit className="w-4 h-4 mr-2" />
          Edit Appraisal
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start px-3 py-2">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>
    </PopoverContent>
  </Popover>
);

const getPerformanceColor = (performance: string) => {
  switch (performance) {
    case "Excellent":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Good":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Average":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "Below Average":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "Poor":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

export const createAppraisalColumns = (): ColumnDef<Appraisal>[] => [
  {
    accessorKey: "employeeName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium hover:bg-transparent"
      >
        Employee
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const appraisal = row.original;
      return (
        <div className="font-medium text-sm">{appraisal.employeeName}</div>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium hover:bg-transparent"
      >
        Type
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("type")}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium hover:bg-transparent"
      >
        Year
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return (
        <div className="text-sm">
          {date ? new Date(date).getFullYear() : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "performance",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium hover:bg-transparent"
      >
        Performance
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const performance = row.getValue("performance") as string;
      return (
        <Badge variant="outline" className={cn("font-medium text-xs", getPerformanceColor(performance))}>
          {performance}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium hover:bg-transparent"
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant="outline" className={cn("font-medium capitalize text-xs", getStatusColor(status))}>
          {status.replace('_', ' ')}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const appraisal = row.original;
      return <RowActions appraisal={appraisal} />;
    },
  },
];