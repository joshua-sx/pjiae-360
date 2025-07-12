import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreVertical, Eye, Edit, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Appraisal {
  id: string;
  employeeName: string;
  employeeAvatar?: string;
  jobTitle: string;
  department: string;
  division?: string;
  appraisalType: string;
  score: number;
  scoreLabel: string;
  dateOfAppraisal: string;
  status: "Completed" | "In Progress" | "Not Started" | "Overdue";
  appraiser: string;
  reviewPeriod: string;
  lastModified: string;
  createdBy: string;
  completedDate?: string;
  dueDate: string;
}

const getStatusColor = (status: Appraisal["status"]) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800 hover:bg-green-100/80";
    case "In Progress":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
    case "Not Started":
      return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
    case "Overdue":
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
  userRole?: "Employee" | "Manager" | "Appraiser" | "HR";
}

const RowActions = ({ appraisal, userRole = "HR" }: RowActionsProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <MoreVertical className="w-4 h-4" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-48 p-0" align="end">
      <div className="py-1">
        <Button variant="ghost" size="sm" className="w-full justify-start px-3 py-2">
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
        {(userRole === "Appraiser" || userRole === "HR") && (
          <Button variant="ghost" size="sm" className="w-full justify-start px-3 py-2">
            <Edit className="w-4 h-4 mr-2" />
            Edit Appraisal
          </Button>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start px-3 py-2">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>
    </PopoverContent>
  </Popover>
);

export const createAppraisalColumns = (userRole?: "Employee" | "Manager" | "Appraiser" | "HR"): ColumnDef<Appraisal>[] => [
  {
    accessorKey: "employeeName",
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
      const appraisal = row.original;
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={appraisal.employeeAvatar} alt={appraisal.employeeName} />
            <AvatarFallback className="text-xs">
              {appraisal.employeeName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{appraisal.employeeName}</div>
            <div className="text-sm text-muted-foreground">{appraisal.jobTitle}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "department",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium"
      >
        Department
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const appraisal = row.original;
      return (
        <div>
          <div className="font-medium">{appraisal.department}</div>
          {appraisal.division && (
            <div className="text-sm text-muted-foreground">{appraisal.division}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "appraisalType",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium"
      >
        Type
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("appraisalType")}</div>
    ),
  },
  {
    accessorKey: "score",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium"
      >
        Score
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const appraisal = row.original;
      return (
        <div className="space-y-1">
          <div className="font-medium">{appraisal.score.toFixed(1)}</div>
          <Badge variant="secondary" className={getScoreColor(appraisal.scoreLabel)}>
            {appraisal.scoreLabel}
          </Badge>
        </div>
      );
    },
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
      const status = row.getValue("status") as Appraisal["status"];
      return (
        <Badge variant="secondary" className={getStatusColor(status)}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "dateOfAppraisal",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium"
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("dateOfAppraisal") as string;
      return (
        <div className="text-sm">
          {new Date(date).toLocaleDateString()}
        </div>
      );
    },
  },
  {
    accessorKey: "appraiser",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium"
      >
        Appraiser
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const appraiser = row.getValue("appraiser") as string;
      return <div className="text-sm">{appraiser}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const appraisal = row.original;
      return <RowActions appraisal={appraisal} userRole={userRole} />;
    },
  },
];