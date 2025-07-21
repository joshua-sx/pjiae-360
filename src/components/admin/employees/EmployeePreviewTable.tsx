
import React, { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationPrevious, 
  PaginationNext 
} from "@/components/ui/pagination";

import { EmployeeData } from "./import/types";

interface EmployeePreviewTableProps {
  employees: EmployeeData[];
}

export function EmployeePreviewTable({ employees }: EmployeePreviewTableProps) {
  // Pagination settings
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const totalPages = Math.ceil(employees.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, employees.length);
  const currentEmployees = employees.slice(startIndex, endIndex);

  const columns: ColumnDef<EmployeeData>[] = useMemo(() => [
    {
      accessorKey: "employeeId",
      header: "Employee ID",
      cell: ({ row }) => (
        <div className="text-sm w-24">
          {row.original.employeeId || <span className="text-muted-foreground">N/A</span>}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium w-40">
          {row.original.firstName} {row.original.lastName}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-muted-foreground w-56">
          {row.original.email}
        </div>
      ),
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
      cell: ({ row }) => (
        <div className="text-sm w-32">
          {row.original.phoneNumber || <span className="text-muted-foreground">N/A</span>}
        </div>
      ),
    },
    {
      accessorKey: "jobTitle",
      header: "Job Title",
      cell: ({ row }) => (
        <div className="w-40">
          {row.original.jobTitle || <span className="text-muted-foreground">N/A</span>}
        </div>
      ),
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => (
        <div className="w-32">
          {row.original.department ? (
            <Badge variant="secondary">{row.original.department}</Badge>
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </div>
      ),
    },
  ], []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      {/* Employee Count */}
      <div className="text-sm text-muted-foreground">
        {employees.length === 1 
          ? "1 employee ready to import"
          : `${employees.length} employees ready to import`
        }
        {employees.length > pageSize && (
          <span className="ml-2">
            (Showing {startIndex + 1}-{endIndex} of {employees.length})
          </span>
        )}
      </div>

      {/* Table Container with Horizontal Scrolling */}
      <div className="w-full max-w-full">
        <DataTable 
          columns={columns} 
          data={currentEmployees}
          enablePagination={false}
          enableSorting={false}
          enableFiltering={false}
          enableHorizontalScroll={true}
        />
      </div>

      {/* Pagination Controls (only show if > 10 employees) */}
      {employees.length > pageSize && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
