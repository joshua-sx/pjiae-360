import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DataTableFilterListProps<TData> {
  table: Table<TData>;
}

export function DataTableFilterList<TData>({
  table,
}: DataTableFilterListProps<TData>) {
  const columnFilters = table.getState().columnFilters;

  if (columnFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {columnFilters.map((filter) => {
        const column = table.getColumn(filter.id);
        const columnMeta = column?.columnDef.meta as any;
        
        return (
          <Badge key={filter.id} variant="secondary" className="gap-1">
            {columnMeta?.label || filter.id}: {String(filter.value)}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => column?.setFilterValue(undefined)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        );
      })}
    </div>
  );
}