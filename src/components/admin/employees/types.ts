export type { Employee } from "@/types/shared";

export interface EmployeeFilters {
  search: string;
  status: string;
  role: string;
  division: string;
  department: string;
}
