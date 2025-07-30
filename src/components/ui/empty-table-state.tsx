import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";

interface EmptyTableStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ComponentType<{ className?: string }>;
  showSearchTip?: boolean;
}

export function EmptyTableState({
  title = "No results found",
  description = "Try adjusting your filters or search terms",
  action,
  icon: Icon = Search,
  showSearchTip = true
}: EmptyTableStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} className="mt-4" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          {action.label}
        </Button>
      )}
      {showSearchTip && !action && (
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Filter className="h-3 w-3" />
          <span>Try clearing filters or searching with different terms</span>
        </div>
      )}
    </div>
  );
}