import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Eye, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Employee } from "./types";

export const employeeColumns: ColumnDef<Employee>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const employee = row.original;
      const displayName = employee.user_profile?.first_name && employee.user_profile?.last_name 
        ? `${employee.user_profile.first_name} ${employee.user_profile.last_name}`.trim() 
        : employee.user_profile?.email || employee.employee_number || `Employee ${employee.id.slice(0,8)}`;
      const initials = employee.user_profile?.first_name && employee.user_profile?.last_name 
        ? `${employee.user_profile.first_name[0]}${employee.user_profile.last_name[0]}`.toUpperCase()
        : displayName[0]?.toUpperCase() || 'E';

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{displayName}</div>
            <div className="text-sm text-muted-foreground">{employee.user_profile?.email || 'No email'}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "job_title",
    header: "Job Title",
    cell: ({ row }) => {
      return <span>{row.original.job_title || "—"}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
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
    accessorKey: "division",
    header: "Division",
    cell: ({ row }) => {
      const division = row.original.division;
      return division ? (
        <span>{division.name}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => {
      const department = row.original.department;
      return department ? (
        <span>{department.name}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "manager",
    header: "Manager",
    cell: ({ row }) => {
      const manager = row.original.manager;
      return manager ? (
        <span>{manager.employee_number || `Manager ${manager.id.slice(0,8)}`}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const employee = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit Employee
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Appraiser
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];