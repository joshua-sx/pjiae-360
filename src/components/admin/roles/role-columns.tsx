import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { EmployeeWithRole } from "@/hooks/useEmployeeRoles";
import { useEmployeeAdminMutations } from "@/hooks/useEmployeeAdminMutations";
import { Check, X, Edit3 } from "lucide-react";
import { useState } from "react";

const EditableJobTitle = ({ employee }: { employee: EmployeeWithRole }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(employee.job_title || '');
  const { updateEmployee, isUpdating } = useEmployeeAdminMutations();

  const handleSave = () => {
    updateEmployee({ id: employee.id, updates: { job_title: value } });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(employee.job_title || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-8"
          disabled={isUpdating}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          disabled={isUpdating}
          className="h-8 w-8 p-0"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={isUpdating}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded p-1 -m-1"
      onClick={() => setIsEditing(true)}
    >
      <span>{employee.job_title || 'No title'}</span>
      <Edit3 className="h-3 w-3 opacity-50" />
    </div>
  );
};

export const createRoleColumns = (
  onAssignRole: (employee: EmployeeWithRole) => void
): ColumnDef<EmployeeWithRole>[] => [
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
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="text-sm text-muted-foreground">{row.original.email}</div>
      </div>
    ),
  },
  {
    accessorKey: "job_title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Job Title" />
    ),
    cell: ({ row }) => <EditableJobTitle employee={row.original} />,
  },
  {
    accessorKey: "current_roles",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Roles" />
    ),
    cell: ({ row }) => (
      <div 
        className="flex gap-1 flex-wrap cursor-pointer hover:bg-muted/50 rounded p-1 -m-1"
        onClick={() => onAssignRole(row.original)}
        title="Click to manage roles"
      >
        {row.original.current_roles?.length ? (
          row.original.current_roles.map((role) => (
            <Badge key={role} variant="secondary" className="text-xs">
              {role}
            </Badge>
          ))
        ) : (
          <Badge variant="outline" className="text-xs">
            No role assigned
          </Badge>
        )}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Button
        onClick={() => onAssignRole(row.original)}
        size="sm"
        variant="outline"
      >
        Assign Role
      </Button>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];