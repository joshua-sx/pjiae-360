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

  // Calculate dynamic height based on number of employees
  const calculateHeight = () => {
    const employeeCount = Math.min(employees.length, pageSize);
    if (employeeCount === 0) return "auto";
    
    // Base height for header + padding, plus ~60px per row
    const baseHeight = 120;
    const rowHeight = 60;
    const calculatedHeight = baseHeight + (employeeCount * rowHeight);
    
    // For small datasets, use exact height; for larger ones, cap at 400px
    if (employees.length <= 5) {
      return `${calculatedHeight}px`;
    } else if (employees.length <= 10) {
      return `${Math.min(calculatedHeight, 400)}px`;
    } else {
      return "400px"; // Fixed height for pagination
    }
  };

  const columns: ColumnDef<EmployeeData>[] = useMemo(() => [
    {
      accessorKey: "employeeId",
      header: "Employee ID",
      cell: ({ row }) => (
        <div className="text-sm min-w-[100px]">
          {row.original.employeeId || <span className="text-muted-foreground">N/A</span>}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium min-w-[150px]">
          {row.original.firstName} {row.original.lastName}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-muted-foreground min-w-[200px]">
          {row.original.email}
        </div>
      ),
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
      cell: ({ row }) => (
        <div className="text-sm min-w-[120px]">
          {row.original.phoneNumber || <span className="text-muted-foreground">N/A</span>}
        </div>
      ),
    },
    {
      accessorKey: "jobTitle",
      header: "Job Title",
      cell: ({ row }) => (
        <div className="min-w-[150px]">
          {row.original.jobTitle || <span className="text-muted-foreground">N/A</span>}
        </div>
      ),
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => (
        <div className="min-w-[120px]">
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

      {/* Table Container with Dynamic Height and Horizontal Scrolling */}
      <div 
        className="border rounded-lg overflow-hidden transition-all duration-300"
        style={{ height: calculateHeight() }}
      >
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
