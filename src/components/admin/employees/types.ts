import { Tables } from "@/integrations/supabase/types";

export interface Employee extends Tables<'employee_info'> {
  division?: Tables<'divisions'>;
  department?: Tables<'departments'>;
  manager?: Tables<'employee_info'>;
  user_profile?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

export interface EmployeeFilters {
  search: string;
  status: string;
  role: string;
  division: string;
  department: string;
}