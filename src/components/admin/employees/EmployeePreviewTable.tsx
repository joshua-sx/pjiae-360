import React, { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";

interface EmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  division: string;
}

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
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.firstName} {row.original.lastName}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.original.email}
        </div>
      ),
    },
    {
      accessorKey: "jobTitle",
      header: "Job Title",
      cell: ({ row }) => (
        <div>
          {row.original.jobTitle || <span className="text-muted-foreground">N/A</span>}
        </div>
      ),
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => (
        <div>
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

      {/* Table Container with Dynamic Height */}
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
        />
      </div>

      {/* Pagination Controls (only show if > 10 employees) */}
      {employees.length > pageSize && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 text-sm border rounded ${
                    currentPage === i 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handlePageChange(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}