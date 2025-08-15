import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bookmark, Plus, Trash2, Share } from "lucide-react";
import { useSavedFilters, SavedFilter } from "@/hooks/useSavedFilters";
import { useToast } from "@/hooks/use-toast";

interface SavedFiltersDropdownProps {
  entity: SavedFilter["entity"];
  currentFilters: Record<string, any>;
  onApplyFilter: (filters: Record<string, any>) => void;
}

export const SavedFiltersDropdown = ({ 
  entity, 
  currentFilters, 
  onApplyFilter 
}: SavedFiltersDropdownProps) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const { savedFilters, saveFilter, deleteFilter, applyFilter } = useSavedFilters(entity);
  const { toast } = useToast();

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the filter",
        variant: "destructive",
      });
      return;
    }

    try {
      saveFilter(filterName.trim(), currentFilters);
      toast({
        title: "Filter Saved",
        description: `Filter "${filterName}" has been saved`,
      });
      setFilterName("");
      setSaveDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save filter",
        variant: "destructive",
      });
    }
  };

  const handleApplyFilter = (filterId: string) => {
    const filters = applyFilter(filterId);
    onApplyFilter(filters);
    toast({
      title: "Filter Applied",
      description: "Saved filter has been applied",
    });
  };

  const handleDeleteFilter = (filterId: string, filterName: string) => {
    deleteFilter(filterId);
    toast({
      title: "Filter Deleted",
      description: `Filter "${filterName}" has been deleted`,
    });
  };

  const handleShareCurrentView = () => {
    const url = new URL(window.location.href);
    
    // Encode current filters in URL
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, JSON.stringify(value));
      }
    });

    navigator.clipboard.writeText(url.toString());
    toast({
      title: "Link Copied",
      description: "Current view link copied to clipboard",
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-background border border-border shadow-lg">
          <DropdownMenuItem onClick={() => setSaveDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Save Current Filters
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShareCurrentView}>
            <Share className="h-4 w-4 mr-2" />
            Share Current View
          </DropdownMenuItem>
          
          {savedFilters.length > 0 && (
            <>
              <DropdownMenuSeparator />
              {savedFilters.map((filter) => (
                <div key={filter.id} className="flex items-center group">
                  <DropdownMenuItem 
                    className="flex-1"
                    onClick={() => handleApplyFilter(filter.id)}
                  >
                    <Bookmark className="h-4 w-4 mr-2" />
                    {filter.name}
                  </DropdownMenuItem>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFilter(filter.id, filter.name);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter</DialogTitle>
            <DialogDescription>
              Give your current filter settings a name so you can quickly apply them later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filter-name">Filter Name</Label>
              <Input
                id="filter-name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="e.g., Overdue Goals"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveFilter();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFilter} disabled={!filterName.trim()}>
              Save Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};