
import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTableScroll } from "@/hooks/use-table-scroll";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyTableState } from "@/components/ui/empty-table-state";

interface DataTableProps<TData, TValue> {
  table?: any;
  columns?: ColumnDef<TData, TValue>[];
  data?: TData[];
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  enableSelection?: boolean;
  enableHorizontalScroll?: boolean;
  className?: string;
  onRowClick?: (row: TData) => void;
  getRowCanExpand?: (row: any) => boolean;
  renderSubComponent?: (props: { row: any }) => React.ReactElement;
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  table: providedTable,
  columns,
  data,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = false,
  enableSelection = false,
  enableHorizontalScroll = false,
  className,
  onRowClick,
  getRowCanExpand,
  renderSubComponent,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const fallbackTable = useReactTable({
    data: data || [],
    columns: columns || [],
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: enableSelection ? setRowSelection : undefined,
    getRowCanExpand,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: enableSelection ? rowSelection : {},
    },
  });

  const table = providedTable || fallbackTable;

  const { containerRef, canScrollLeft, canScrollRight, scrollLeft, scrollRight } = useTableScroll({
    enableKeyboardNavigation: enableHorizontalScroll,
    scrollBehavior: "smooth",
  });

  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const setScrollContainerRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (enableHorizontalScroll) {
        // keep horizontal scrolling behavior
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
      scrollRef.current = node;
    },
    [enableHorizontalScroll, containerRef]
  );

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 56,
    overscan: 8,
  });

  return (
    <div className={cn("w-full", className)}>
      <div className="relative w-full">
        {enableHorizontalScroll && (
          <>
            {canScrollLeft && (
              <Button
                variant="outline"
                size="sm"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 bg-background/90 backdrop-blur-sm border shadow-md"
                onClick={scrollLeft}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {canScrollRight && (
              <Button
                variant="outline"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 bg-background/90 backdrop-blur-sm border shadow-md"
                onClick={scrollRight}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
        
        <div
          ref={setScrollContainerRef}
          className={cn(
            "rounded-md border w-full",
            enableHorizontalScroll && "overflow-x-auto"
          )}
        >
          <Table className="w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map((header) => (
                    <TableHead 
                      key={header.id} 
                      className="px-4 py-3 text-left font-medium text-sm whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b">
                    {(columns || table.getAllColumns()).map((_, colIndex) => (
                      <TableCell 
                        key={colIndex} 
                        className="px-4 py-3"
                      >
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "border-b hover:bg-muted/50",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-4 py-3 text-sm whitespace-nowrap"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns?.length || table.getAllColumns().length}
                    className="px-4 py-8 text-center"
                  >
                    <EmptyTableState />
                  </TableCell>
                </TableRow>
              )}
              {table.getRowModel().rows?.length > 0 && renderSubComponent && 
                table.getRowModel().rows.map((row) => 
                  row.getIsExpanded() && (
                    <TableRow key={`${row.id}-expanded`}>
                      <TableCell colSpan={row.getVisibleCells().length} className="px-4 py-3">
                        {renderSubComponent({ row })}
                      </TableCell>
                    </TableRow>
                  )
                )
              }
            </TableBody>
          </Table>
        </div>
      </div>

      {enablePagination && !isLoading && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2 py-4">
          <div className="text-sm text-muted-foreground order-2 sm:order-1">
            {enableSelection && (
              <>
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </>
            )}
            {!enableSelection && (
              <>
                Showing {table.getRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} results
              </>
            )}
          </div>
          <div className="flex items-center space-x-2 order-1 sm:order-2">
            <div className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="tap-target"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="tap-target"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
