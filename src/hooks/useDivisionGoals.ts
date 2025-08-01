import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDemoMode } from "@/contexts/DemoModeContext";

export interface DivisionGoal {
  id: string;
  title: string;
  description: string | null;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
  year: string;
}

interface UseDivisionGoalsOptions {
  year?: string;
}

export function useDivisionGoals(options: UseDivisionGoalsOptions = {}) {
  const { year } = options;
  const { isDemoMode } = useDemoMode();

  const query = useQuery({
    queryKey: ["division-goals", year, isDemoMode],
    queryFn: async (): Promise<DivisionGoal[]> => {
      if (isDemoMode) {
        return [];
      }

      let q = supabase
        .from("goals")
        .select(
          `id, title, description, created_by, created_at, updated_at, creator:employee_info!goals_created_by_fkey(id, user_id, profiles:profiles!employee_info_user_id_fkey(first_name, last_name))`
        )
        .eq("type", "division")
        .order("created_at", { ascending: false });

      if (year && year !== "All") {
        q = q
          .gte("created_at", `${year}-01-01`)
          .lt("created_at", `${parseInt(year) + 1}-01-01`);
      }

      const { data, error } = await q;
      if (error) throw error;

      return (
        data?.map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          createdByName: row.creator?.profiles
            ? `${row.creator.profiles.first_name ?? ""} ${row.creator.profiles.last_name ?? ""}`.trim()
            : null,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          year: new Date(row.created_at).getFullYear().toString(),
        })) ?? []
      );
    },
  });

  return {
    divisionGoals: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: () => {
      void query.refetch();
    },
  };
}
