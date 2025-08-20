import { useMemo } from "react";
import { Table } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

interface UseStickyColumnsOptions {
  columnVisibility: Record<string, boolean>;
  table: Table<any>;
  stickyColumns?: string[];
  stickyRightColumns?: string[];
}

export function useStickyColumns({
  columnVisibility,
  table,
  stickyColumns = ["select", "name"],
  stickyRightColumns = ["actions"]
}: UseStickyColumnsOptions) {
  
  const { leftPositions, rightPositions } = useMemo(() => {
    const leftPositions: Record<string, number> = {};
    const rightPositions: Record<string, number> = {};
    let currentLeftPosition = 0;
    let currentRightPosition = 0;
    
    const allColumns = table.getAllColumns();
    
    // Calculate left sticky positions
    allColumns.forEach((column) => {
      const columnId = column.id;
      const isVisible = columnVisibility[columnId] !== false;
      const isLeftSticky = stickyColumns.includes(columnId);
      
      if (isLeftSticky && isVisible) {
        leftPositions[columnId] = currentLeftPosition;
        
        // Estimate column width based on column type
        let width = 120; // default width
        if (columnId === "select") width = 50;
        else if (columnId === "name") width = 200;
        else if (columnId === "id") width = 100;
        
        currentLeftPosition += width;
      }
    });
    
    // Calculate right sticky positions (from right edge)
    [...allColumns].reverse().forEach((column) => {
      const columnId = column.id;
      const isVisible = columnVisibility[columnId] !== false;
      const isRightSticky = stickyRightColumns.includes(columnId);
      
      if (isRightSticky && isVisible) {
        rightPositions[columnId] = currentRightPosition;
        
        // Estimate column width based on column type
        let width = 80; // default width for actions
        if (columnId === "actions") width = 80;
        
        currentRightPosition += width;
      }
    });
    
    return { leftPositions, rightPositions };
  }, [columnVisibility, table, stickyColumns, stickyRightColumns]);

  const getStickyStyle = (columnId: string) => {
    const isLeftSticky = stickyColumns.includes(columnId);
    const isRightSticky = stickyRightColumns.includes(columnId);
    const leftPosition = leftPositions[columnId];
    const rightPosition = rightPositions[columnId];
    
    if (isLeftSticky && leftPosition !== undefined) {
      return {
        "--stick-left": `${leftPosition}px`,
      } as React.CSSProperties;
    }
    
    if (isRightSticky && rightPosition !== undefined) {
      return {
        "--stick-right": `${rightPosition}px`,
      } as React.CSSProperties;
    }
    
    return {};
  };

  const getStickyClassName = (columnId: string, baseClassName?: string) => {
    const isLeftSticky = stickyColumns.includes(columnId);
    const isRightSticky = stickyRightColumns.includes(columnId);
    
    return cn(
      baseClassName,
      isLeftSticky && [
        "md:sticky md:left-[var(--stick-left)] md:z-sticky",
        "bg-background",
        "after:absolute after:right-[-12px] after:top-0 after:bottom-0 after:w-3",
        "after:bg-gradient-to-l after:from-transparent after:to-background",
        "after:pointer-events-none after:z-[-1]",
        "group-hover:bg-muted/30 group-hover:after:to-muted/30"
      ],
      isRightSticky && [
        "md:sticky md:right-[var(--stick-right)] md:z-[30]",
        "bg-background",
        "after:absolute after:left-[-12px] after:top-0 after:bottom-0 after:w-3",
        "after:bg-gradient-to-r after:from-transparent after:to-background",
        "after:pointer-events-none after:z-[-1]",
        "group-hover:bg-muted/30 group-hover:after:to-muted/30"
      ]
    );
  };

  return {
    getStickyStyle,
    getStickyClassName,
    leftPositions,
    rightPositions,
  };
}