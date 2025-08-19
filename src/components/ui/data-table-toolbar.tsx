import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Filter, Download, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
  showFilterButton?: boolean;
  children?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  searchValue,
  onSearchChange,
  showCreateButton,
  onCreateClick,
  showFilterButton = false,
  children
}: DataTableToolbarProps<TData>) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border-b">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search appraisals..."
            value={searchValue || ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10"
          />
        </div>
        {children}
      </div>
      
      <div className="flex items-center space-x-2">
        {showFilterButton && (
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        )}
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        {showCreateButton && (
          <Button onClick={onCreateClick} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        )}
      </div>
    </div>
  );
}