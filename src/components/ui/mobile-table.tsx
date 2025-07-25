import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileTableProps<T> {
  data: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
  title?: string;
  onItemClick?: (item: T) => void;
}

export function MobileTable<T>({
  data,
  renderCard,
  className,
  emptyMessage = "No items found",
  title,
  onItemClick,
}: MobileTableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <div className="px-1">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        </div>
      )}
      {data.map((item, index) => (
        <div
          key={index}
          className={cn(
            "mobile-table-card transition-colors",
            onItemClick && "cursor-pointer hover:bg-accent/50 active:bg-accent"
          )}
          onClick={() => onItemClick?.(item)}
        >
          {renderCard(item, index)}
        </div>
      ))}
    </div>
  );
}

interface MobileTableRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function MobileTableRow({ label, value, className }: MobileTableRowProps) {
  return (
    <div className={cn("mobile-table-row", className)}>
      <span className="mobile-table-label">{label}</span>
      <div className="mobile-table-value">{value}</div>
    </div>
  );
}

interface ExpandableMobileCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export function ExpandableMobileCard({
  title,
  subtitle,
  children,
  defaultExpanded = false,
  className,
}: ExpandableMobileCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <Button
          variant="ghost"
          className="w-full p-0 h-auto justify-between"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex flex-col items-start text-left">
            <div className="font-medium">{title}</div>
            {subtitle && (
              <div className="text-sm text-muted-foreground">{subtitle}</div>
            )}
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
}