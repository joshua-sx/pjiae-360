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
      const displayName = employee.name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || employee.email;
      const initials = employee.first_name && employee.last_name 
        ? `${employee.first_name[0]}${employee.last_name[0]}`.toUpperCase()
        : displayName[0]?.toUpperCase() || 'U';

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{displayName}</div>
            <div className="text-sm text-muted-foreground">{employee.email}</div>
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
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;
      return role ? (
        <Badge variant="secondary">{role.name}</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
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
        <span>{manager.name || `${manager.first_name || ''} ${manager.last_name || ''}`.trim()}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const hasUserId = row.original.user_id;
      
      if (status === "invited") {
        return <Badge variant="outline" className="text-orange-600 border-orange-300">Invited</Badge>;
      }
      
      return (
        <Badge 
          variant={status === 'active' ? 'default' : 'secondary'}
          className={status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
        >
          {hasUserId ? "Active" : "Pending"}
        </Badge>
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