import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { useProfileQuery, Profile, Department, Division, Role, Manager } from "./useProfileQuery";

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useProfileQuery();
  const [updating, setUpdating] = useState(false);

  const updateProfile = async (updates: Partial<Omit<Profile, "role_id" | "avatar_url">>) => {
    if (!user || !data?.profile) return;

    setUpdating(true);
    try {
      const { email, first_name, last_name, name, ...employeeUpdates } = updates;
      const updateData = {
        ...employeeUpdates,
        updated_at: new Date().toISOString(),
      } as Record<string, unknown>;
      if (updateData.status) {
        updateData.status = updateData.status as "active" | "inactive" | "pending" | "invited";
      }

      const { data: res, error } = await supabase
        .from("employee_info")
        .update(updateData)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedProfile: Profile = {
        ...data.profile,
        ...res,
      };

      queryClient.setQueryData(["profile", user.id], (prev: any) =>
        prev ? { ...prev, profile: updatedProfile } : prev
      );

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      return { data: updatedProfile, error: null } as const;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Unable to update your profile. Please try again.",
      });
      return { data: null, error } as const;
    } finally {
      setUpdating(false);
    }
  };

  return {
    profile: data?.profile ?? null,
    departments: data?.departments ?? ([] as Department[]),
    divisions: data?.divisions ?? ([] as Division[]),
    roles: data?.roles ?? ([] as Role[]),
    managers: data?.managers ?? ([] as Manager[]),
    loading: isLoading,
    updating,
    updateProfile,
    refetch,
  };
};
