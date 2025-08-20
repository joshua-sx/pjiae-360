import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Edit, Eye, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Employee } from "./types";

export const employeeColumns: ColumnDef<Employee>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() ? "indeterminate" : false)
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    size: 50,
    minSize: 50,
    maxSize: 50,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    size: 240,
    minSize: 200,
    maxSize: 280,
    cell: ({ row }) => {
      const employee = row.original;
      const displayName = employee.profile?.first_name && employee.profile?.last_name 
        ? `${employee.profile.first_name} ${employee.profile.last_name}`.trim() 
        : employee.profile?.email || employee.employee_number || `Employee ${employee.id.slice(0,8)}`;

      return (
        <TooltipProvider>
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0 flex-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="font-medium truncate">{displayName}</div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{displayName}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-sm text-muted-foreground truncate">
                    {employee.profile?.email || 'No email'}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{employee.profile?.email || 'No email'}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "job_title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Job Title" />
    ),
    size: 140,
    minSize: 100,
    maxSize: 160,
    cell: ({ row }) => {
      const jobTitle = row.original.job_title || "—";
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="truncate block cursor-default">{jobTitle}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{jobTitle}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    size: 100,
    minSize: 80,
    maxSize: 120,
    cell: ({ row }) => {
      return (
        <Badge 
          variant={row.original.status === 'active' ? 'default' : 'secondary'}
          className={row.original.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
        >
          {row.original.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "department",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Department" />
    ),
    size: 140,
    minSize: 100,
    maxSize: 180,
    meta: {
      className: "hidden md:table-cell",
    },
    cell: ({ row }) => {
      const department = row.original.department;
      return department ? (
        <span className="truncate block" title={department.name}>{department.name}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "division",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Division" />
    ),
    size: 140,
    minSize: 100,
    maxSize: 180,
    meta: {
      className: "hidden sm:table-cell",
    },
    cell: ({ row }) => {
      const division = row.original.division;
      return division ? (
        <span className="truncate block" title={division.name}>{division.name}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
];