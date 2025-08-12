import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import type { JobTitleMapping } from '@/hooks/useJobTitleMappings';

interface JobTitleMappingColumnsProps {
  onEdit: (mapping: JobTitleMapping) => void;
  onDelete: (mapping: JobTitleMapping) => void;
}

export function createJobTitleMappingColumns({
  onEdit,
  onDelete,
}: JobTitleMappingColumnsProps): ColumnDef<JobTitleMapping>[] {
  return [
    {
      accessorKey: 'normalized_title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Job Title" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.normalized_title}
        </span>
      ),
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        const roleLabels = {
          admin: 'Administrator',
          director: 'Director',
          manager: 'Manager',
          supervisor: 'Supervisor',
          employee: 'Employee',
        };
        
        return (
          <Badge variant="outline">
            {roleLabels[row.original.role] || row.original.role}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'synonyms',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Synonyms" />
      ),
      cell: ({ row }) => {
        const synonyms = row.original.synonyms;
        if (!synonyms || synonyms.length === 0) {
          return <span className="text-muted-foreground">None</span>;
        }
        
        return (
          <div className="flex flex-wrap gap-1">
            {synonyms.slice(0, 3).map((synonym) => (
              <Badge key={synonym} variant="secondary" className="text-xs">
                {synonym}
              </Badge>
            ))}
            {synonyms.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{synonyms.length - 3} more
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return (
          <span className="text-muted-foreground">
            {date.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const mapping = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(mapping)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(mapping)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}