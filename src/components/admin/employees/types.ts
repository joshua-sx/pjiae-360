import { Tables } from "@/integrations/supabase/types";

export interface Employee extends Tables<'employee_info'> {
  division?: Tables<'divisions'>;
  department?: Tables<'departments'>;
  manager?: Tables<'employee_info'>;
  profile?: Tables<'profiles'>;
}

export interface EmployeeFilters {
  search: string;
  status: string;
  role: string;
  division: string;
  department: string;
}