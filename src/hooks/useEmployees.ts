import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/components/admin/employees/types";

export const useEmployees = () => {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async (): Promise<Employee[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          role:roles(*),
          division:divisions(*),
          department:departments(*),
          manager:profiles!profiles_manager_id_fkey(
            id,
            first_name,
            last_name,
            name
          )
        `)
        .order("first_name", { ascending: true });

      if (error) {
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        manager: Array.isArray(item.manager) ? item.manager[0] : item.manager
      })) as Employee[];
    },
  });
};