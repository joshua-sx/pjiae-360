import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface OnboardingStatus {
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
}

export function useOnboardingStatus() {
  const { user } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOnboardingStatus = async () => {
    if (!user) {
      setOnboardingCompleted(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("employee_info")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Database error fetching onboarding status:", error);
        setOnboardingCompleted(false);
        return;
      }

      // If no employee_info record exists, user hasn't completed onboarding
      if (!data) {
        console.log("No employee_info found for user - onboarding not completed");
        setOnboardingCompleted(false);
        return;
      }

      // Use status to determine if onboarding is completed
      setOnboardingCompleted(data.status === "active");
    } catch (error) {
      console.error("Unexpected error fetching onboarding status:", error);
      setOnboardingCompleted(false);
    } finally {
      setLoading(false);
    }
  };

  const markOnboardingComplete = async (organizationId?: string) => {
    if (!user) return { success: false, error: "User not authenticated" };

    try {
      // First, check if employee_info exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("employee_info")
        .select("id, organization_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching existing employee info:", fetchError);
        return { success: false, error: "Failed to fetch user profile" };
      }

      let profileOrgId = existingProfile?.organization_id;

      // If no employee_info exists, create it with the provided organization_id
      if (!existingProfile) {
        if (!organizationId) {
          return { success: false, error: "Organization ID required for new users" };
        }

        const { error: createError } = await supabase.from("employee_info").insert({
          user_id: user.id,
          organization_id: organizationId,
          status: "active",
        });

        if (createError) {
          console.error("Error creating employee info:", createError);
          return { success: false, error: "Failed to create user profile" };
        }

        profileOrgId = organizationId;
      } else {
        // Update existing employee_info to active status
        const { error: updateError } = await supabase
          .from("employee_info")
          .update({ status: "active" })
          .eq("user_id", user.id);

        if (updateError) {
          console.error("Error updating employee status:", updateError);
          return { success: false, error: "Failed to update user status" };
        }
      }

      // Assign admin role using secure RPC
      const { data: roleData, error: roleError } = await supabase.rpc("assign_user_role_secure", {
        _target_user_id: user.id,
        _role: "admin",
        _reason: "onboarding_complete",
      });

      if (roleError) {
        console.error("Failed to assign admin role:", roleError);
        return { success: false, error: roleError.message };
      }

      const roleResult = roleData as { success: boolean; error?: string } | null;
      if (!roleResult?.success) {
        console.error("Failed to assign admin role:", roleResult?.error);
        return { success: false, error: roleResult?.error ?? "Failed to assign admin role" };
      }

      setOnboardingCompleted(true);
      return { success: true };
    } catch (error) {
      console.error("Error marking onboarding complete:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  };

  useEffect(() => {
    fetchOnboardingStatus();
  }, [user]);

  return {
    onboardingCompleted,
    loading,
    markOnboardingComplete,
    refetch: fetchOnboardingStatus,
  };
}
