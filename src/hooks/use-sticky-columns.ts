import { useMemo } from "react";
import { Table } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

interface UseStickyColumnsOptions {
  columnVisibility: Record<string, boolean>;
  table: Table<any>;
  stickyColumns?: string[];
}

export function useStickyColumns({
  columnVisibility,
  table,
  stickyColumns = ["select", "name", "actions"]
}: UseStickyColumnsOptions) {
  
  const stickyPositions = useMemo(() => {
    const positions: Record<string, number> = {};
    let currentPosition = 0;
    
    // Calculate positions for visible sticky columns
    const allColumns = table.getAllColumns();
    
    allColumns.forEach((column) => {
      const columnId = column.id;
      const isVisible = columnVisibility[columnId] !== false;
      const isSticky = stickyColumns.includes(columnId);
      
      if (isSticky && isVisible) {
        positions[columnId] = currentPosition;
        
        // Estimate column width based on column type
        let width = 120; // default width
        if (columnId === "select") width = 50;
        else if (columnId === "actions") width = 80;
        else if (columnId === "name") width = 200;
        
        currentPosition += width;
      }
    });
    
    return positions;
  }, [columnVisibility, table, stickyColumns]);

  const getStickyStyle = (columnId: string) => {
    const isSticky = stickyColumns.includes(columnId);
    const position = stickyPositions[columnId];
    
    if (!isSticky || position === undefined) return {};
    
    return {
      "--stick-left": `${position}px`,
    } as React.CSSProperties;
  };

  const getStickyClassName = (columnId: string, baseClassName?: string) => {
    const isSticky = stickyColumns.includes(columnId);
    
    return cn(
      baseClassName,
      isSticky && [
        "md:sticky md:left-[var(--stick-left)] md:z-sticky",
        "bg-background/95 backdrop-blur-sm",
        "border-r border-border",
        "before:absolute before:right-0 before:top-0 before:bottom-0 before:w-px before:bg-border",
        "after:absolute after:right-[-12px] after:top-0 after:bottom-0 after:w-3",
        "after:bg-gradient-to-r after:from-background after:to-transparent",
        "after:pointer-events-none"
      ]
    );
  };

  return {
    getStickyStyle,
    getStickyClassName,
    stickyPositions,
  };
}