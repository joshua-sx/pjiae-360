import * as React from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  type PaginationState,
  type TableOptions,
} from "@tanstack/react-table";

interface UseDataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  pageCount?: number;
  initialState?: {
    sorting?: SortingState;
    columnFilters?: ColumnFiltersState;
    columnVisibility?: VisibilityState;
    rowSelection?: RowSelectionState;
    pagination?: PaginationState;
  };
  getRowId?: (originalRow: TData, index: number) => string;
  enableRowSelection?: boolean;
  enableMultiRowSelection?: boolean;
  onRowSelectionChange?: (rowSelection: RowSelectionState) => void;
}

export function useDataTable<TData>({
  data,
  columns,
  pageCount,
  initialState,
  getRowId,
  enableRowSelection = false,
  enableMultiRowSelection = true,
  onRowSelectionChange,
}: UseDataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>(
    initialState?.sorting || []
  );
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    initialState?.columnFilters || []
  );
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    initialState?.columnVisibility || {}
  );
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
    initialState?.rowSelection || {}
  );
  const [pagination, setPagination] = React.useState<PaginationState>(
    initialState?.pagination || { pageIndex: 0, pageSize: 10 }
  );

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    enableRowSelection: enableRowSelection,
    enableMultiRowSelection: enableMultiRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newSelection);
      onRowSelectionChange?.(newSelection);
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: pageCount !== undefined,
    getRowId,
  } as TableOptions<TData>);

  return { table };
}