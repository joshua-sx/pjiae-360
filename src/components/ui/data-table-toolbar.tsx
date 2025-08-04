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
  children?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  searchValue,
  onSearchChange,
  showCreateButton,
  onCreateClick,
  children
}: DataTableToolbarProps<TData>) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="responsive-spacing border-b">
      <div className="mobile-button-group">
        <div className="flex flex-1 items-center responsive-gap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search appraisals..."
              value={searchValue || ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10 responsive-touch-target"
              size="default"
            />
          </div>
          {children}
        </div>
        
        <div className="flex items-center responsive-gap">
          <Button variant="outline" size="default" className="responsive-touch-target">
            <Filter className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          <Button variant="outline" size="default" className="responsive-touch-target">
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          {showCreateButton && (
            <Button onClick={onCreateClick} size="default" className="responsive-touch-target">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Create</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}