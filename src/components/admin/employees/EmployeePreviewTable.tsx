
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
  columnMapping?: Record<string, string>;
}

export function EmployeePreviewTable({ employees, columnMapping }: EmployeePreviewTableProps) {
  // Pagination settings
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const totalPages = Math.ceil(employees.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, employees.length);
  const currentEmployees = employees.slice(startIndex, endIndex);

  // Helper function to check if a field has data in at least one employee
  const hasData = (fieldKey: string) => {
    return employees.some(emp => {
      const value = emp[fieldKey as keyof EmployeeData];
      return value && value.toString().trim().length > 0;
    });
  };

  // Helper function to check if a field was mapped
  const isMapped = (fieldKey: string) => {
    if (!columnMapping) return true; // Show all columns if no mapping provided
    return Object.values(columnMapping).includes(fieldKey);
  };

  // Define column configurations with field keys
  const columnConfigs = [
    {
      fieldKey: "name",
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: any) => (
        <div className="font-medium w-40">
          {row.original.firstName} {row.original.lastName}
        </div>
      ),
    },
    {
      fieldKey: "email",
      accessorKey: "email",
      header: "Email",
      cell: ({ row }: any) => (
        <div className="text-muted-foreground w-56">
          {row.original.email}
        </div>
      ),
    },
    {
      fieldKey: "jobTitle",
      accessorKey: "jobTitle",
      header: "Job Title",
      cell: ({ row }: any) => (
        <div className="w-40">
          {row.original.jobTitle || <span className="text-muted-foreground">N/A</span>}
        </div>
      ),
    },
    {
      fieldKey: "department",
      accessorKey: "department",
      header: "Department",
      cell: ({ row }: any) => (
        <div className="w-32">
          {row.original.department ? (
            <Badge variant="secondary">{row.original.department}</Badge>
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </div>
      ),
    },
    {
      fieldKey: "division",
      accessorKey: "division",
      header: "Division",
      cell: ({ row }: any) => (
        <div className="w-32">
          {row.original.division ? (
            <Badge variant="secondary">{row.original.division}</Badge>
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </div>
      ),
    },
    {
      fieldKey: "phoneNumber",
      accessorKey: "phoneNumber",
      header: "Phone Number",
      cell: ({ row }: any) => (
        <div className="w-32">
          {row.original.phoneNumber || <span className="text-muted-foreground">N/A</span>}
        </div>
      ),
    },
    {
      fieldKey: "employeeId",
      accessorKey: "employeeId",
      header: "Employee ID",
      cell: ({ row }: any) => (
        <div className="text-sm w-24">
          {row.original.employeeId || <span className="text-muted-foreground">N/A</span>}
        </div>
      ),
    },
    {
      fieldKey: "ranking",
      accessorKey: "ranking",
      header: "Ranking",
      cell: ({ row }: any) => (
        <div className="w-32">
          {row.original.ranking || <span className="text-muted-foreground">N/A</span>}
        </div>
      ),
    },
    {
      fieldKey: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <div className="w-32">
          {row.original.status ? (
            <Badge variant="outline">{row.original.status}</Badge>
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </div>
      ),
    },
  ];

  // Filter columns to only show mapped fields with data
  const columns: ColumnDef<EmployeeData>[] = useMemo(() => {
    return columnConfigs
      .filter(config => {
        const { fieldKey } = config;
        
        // Always show name and email as they are required
        if (fieldKey === 'name' || fieldKey === 'email') {
          return true;
        }
        
        // For other fields, check if they were mapped and have data
        return isMapped(fieldKey) && hasData(fieldKey);
      })
      .map(({ fieldKey, ...column }) => column); // Remove fieldKey from final column definition
  }, [employees, columnMapping]);

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
