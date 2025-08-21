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
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTableScroll } from "@/hooks/use-table-scroll";
import { useStickyColumns } from "@/hooks/use-sticky-columns";
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
  showViewOptions?: boolean;
  stickyColumns?: string[];
  className?: string;
  onRowClick?: (row: TData) => void;
  getRowCanExpand?: (row: any) => boolean;
  renderSubComponent?: (props: { row: any }) => React.ReactElement;
  isLoading?: boolean;
  searchKey?: string;
  searchPlaceholder?: string;
  density?: "compact" | "comfortable" | "spacious";
}

export function DataTable<TData, TValue>({
  table: providedTable,
  columns,
  data,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  enableSelection = true,
  enableHorizontalScroll = false,
  showViewOptions = true,
  stickyColumns = [],
  className,
  onRowClick,
  getRowCanExpand,
  renderSubComponent,
  isLoading = false,
  searchKey = "name",
  searchPlaceholder = "Search...",
  density = "comfortable",
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
    enableRowSelection: enableSelection,
    getRowCanExpand,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: enableSelection ? rowSelection : {},
    },
  });

  const table = providedTable || fallbackTable;

  const { containerRef, canScrollLeft, canScrollRight, scrollLeft, scrollRight, isScrollable } =
    useTableScroll({
      enableKeyboardNavigation: enableHorizontalScroll,
      scrollBehavior: "smooth",
      useColumnWidths: enableHorizontalScroll,
      columns: (columns || []).map((col) => ({
        key: col.id || "",
        width: col.size || 150,
        resizable: true,
      })),
    });

  const stickyColumnsHook = useStickyColumns({
    columnVisibility,
    table,
    stickyColumns: stickyColumns.length > 0 ? stickyColumns : ["select", "name"],
    stickyRightColumns: ["actions"],
  });

  const setScrollContainerRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (enableHorizontalScroll) {
        // keep horizontal scrolling behavior
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [enableHorizontalScroll, containerRef]
  );

  return (
    <div className={cn("w-full max-w-full", className)}>
      {(enableFiltering || showViewOptions) && (
        <div className="flex items-center justify-between py-4">
          <div className="flex flex-1 items-center space-x-2">
            {enableFiltering && (
              <Input
                placeholder={searchPlaceholder}
                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
                className="h-8 w-[150px] lg:w-[250px]"
              />
            )}
          </div>
          {showViewOptions && <DataTableViewOptions table={table} />}
        </div>
      )}
      <div className="relative w-full max-w-full">
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
            "rounded-md border w-full max-w-full table-scroll-container border-l-0 border-r-0",
            enableHorizontalScroll &&
              "overflow-x-auto overscroll-x-none scrollbar-hide mobile-scroll md:border-l md:border-r border-border"
          )}
          data-scroll-left={canScrollLeft}
          data-scroll-right={canScrollRight}
        >
          <Table
            className={cn("w-full", !enableHorizontalScroll && "table-fixed")}
            density={density}
          >
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map((header) => {
                    const columnDef = header.column.columnDef;
                    const metaClassName = columnDef.meta?.className || "";
                    const width = columnDef.size ? `${columnDef.size}px` : undefined;
                    const minWidth = columnDef.minSize ? `${columnDef.minSize}px` : undefined;
                    const maxWidth = columnDef.maxSize ? `${columnDef.maxSize}px` : undefined;

                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          enableHorizontalScroll ? "whitespace-nowrap" : "break-words",
                          metaClassName,
                          stickyColumnsHook.getStickyClassName(header.column.id)
                        )}
                        style={{
                          width,
                          minWidth,
                          maxWidth,
                          ...stickyColumnsHook.getStickyStyle(header.column.id),
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b">
                    {(columns || table.getAllColumns()).map((_, colIndex) => (
                      <TableCell key={colIndex} className="px-4 py-3">
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
                      "border-b hover:bg-muted/30 transition-colors",
                      row.getIsSelected() && "bg-muted/50 hover:bg-muted/60",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const columnDef = cell.column.columnDef;
                      const metaClassName = columnDef.meta?.className || "";
                      const width = columnDef.size ? `${columnDef.size}px` : undefined;
                      const minWidth = columnDef.minSize ? `${columnDef.minSize}px` : undefined;
                      const maxWidth = columnDef.maxSize ? `${columnDef.maxSize}px` : undefined;

                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            enableHorizontalScroll ? "whitespace-nowrap" : "break-words",
                            metaClassName,
                            stickyColumnsHook.getStickyClassName(cell.column.id)
                          )}
                          style={{
                            width,
                            minWidth,
                            maxWidth,
                            ...stickyColumnsHook.getStickyStyle(cell.column.id),
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
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
              {table.getRowModel().rows?.length > 0 &&
                renderSubComponent &&
                table.getRowModel().rows.map(
                  (row) =>
                    row.getIsExpanded() && (
                      <TableRow key={`${row.id}-expanded`}>
                        <TableCell colSpan={row.getVisibleCells().length} className="px-4 py-3">
                          {renderSubComponent({ row })}
                        </TableCell>
                      </TableRow>
                    )
                )}
            </TableBody>
          </Table>
        </div>
      </div>

      {enablePagination && !isLoading && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {enableSelection ? (
              <>
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </>
            ) : (
              <>
                Showing {table.getRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} results
              </>
            )}
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="h-8 w-[80px]">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="hidden h-8 w-8 p-0 lg:flex"
              >
                <span className="sr-only">Go to first page</span>
                <ChevronLeft className="h-4 w-4" />
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="hidden h-8 w-8 p-0 lg:flex"
              >
                <span className="sr-only">Go to last page</span>
                <ChevronRight className="h-4 w-4" />
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
