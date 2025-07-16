import { Tables } from "@/integrations/supabase/types";

export interface Employee extends Tables<'profiles'> {
  role?: Tables<'roles'>;
  division?: Tables<'divisions'>;
  department?: Tables<'departments'>;
  manager?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    name: string | null;
  };
}

export interface EmployeeFilters {
  search: string;
  status: string;
  role: string;
  division: string;
  department: string;
}