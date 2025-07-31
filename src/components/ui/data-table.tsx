
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
    <div className={cn("space-y-4 w-full", className)}>
      <div className="relative w-full max-w-full">
        {enableHorizontalScroll && (
          <>
            {canScrollLeft && (
              <Button
                variant="outline"
                size="sm"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 table-action-btn bg-background/90 backdrop-blur-sm border shadow-md"
                onClick={scrollLeft}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {canScrollRight && (
              <Button
                variant="outline"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 table-action-btn bg-background/90 backdrop-blur-sm border shadow-md"
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
            "rounded-md border w-full mobile-scroll",
            enableHorizontalScroll && "overflow-x-auto max-w-full mobile-scroll-x"
          )}
        >
          <Table className="w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="whitespace-nowrap px-2 sm:px-4 text-xs sm:text-sm">
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
            <TableBody
              style={{
                display: "block",
                position: "relative",
                height: isLoading ? undefined : rowVirtualizer.getTotalSize(),
              }}
            >
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {(columns || table.getAllColumns()).map((_, colIndex) => (
                      <TableCell key={colIndex} className="px-2 py-3 sm:px-4 sm:py-2">
                        <Skeleton
                          className={`h-4 ${
                            colIndex === 0
                              ? "w-32"
                              : colIndex ===
                                (columns?.length || table.getAllColumns().length) - 1
                              ? "w-16"
                              : "w-24"
                          }`}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const row = table.getRowModel().rows[virtualRow.index];
                  return (
                    <div
                      key={row.id}
                      ref={virtualRow.measureElement}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <TableRow
                        data-state={row.getIsSelected() && "selected"}
                        className={cn(
                          "transition-colors",
                          onRowClick && "cursor-pointer hover:bg-muted/50"
                        )}
                        onClick={() => onRowClick?.(row.original)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className="px-2 py-3 sm:px-4 sm:py-2 text-xs sm:text-sm"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                      {row.getIsExpanded() && renderSubComponent && (
                        <TableRow>
                          <TableCell colSpan={row.getVisibleCells().length}>
                            {renderSubComponent({ row })}
                          </TableCell>
                        </TableRow>
                      )}
                    </div>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns?.length || table.getAllColumns().length}
                    className="p-0"
                  >
                    <EmptyTableState />
                  </TableCell>
                </TableRow>
              )}
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
