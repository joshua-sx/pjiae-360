import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface OnboardingStatus {
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
}

export type OnboardingState = 'pre-onboarding' | 'in-onboarding' | 'completed';

export function useOnboardingStatus() {
  const { user } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [onboardingState, setOnboardingState] = useState<OnboardingState>('pre-onboarding');
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
        // Set to false to allow onboarding access on database errors
        setOnboardingCompleted(false);
        return;
      }

      // If no employee_info record exists, user is in pre-onboarding state
      if (!data) {
        console.log("No employee_info found for user - user is in pre-onboarding state");
        setOnboardingCompleted(false);
        setOnboardingState('pre-onboarding');
        return;
      }

      // Use status to determine if onboarding is completed
      const completed = data.status === "active";
      console.log("Employee info found:", { status: data.status, completed });
      setOnboardingCompleted(completed);
      
      if (completed) {
        setOnboardingState('completed');
      } else {
        setOnboardingState('in-onboarding');
      }
    } catch (error) {
      console.error("Unexpected error fetching onboarding status:", error);
      // Set to false to allow onboarding access on unexpected errors
      setOnboardingCompleted(false);
      setOnboardingState('pre-onboarding');
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

      // Assign admin role using direct insert (leverages RLS for initial admin role)
      console.log("Assigning admin role to user:", user.id, "in org:", profileOrgId);
      
      try {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: 'admin',
            organization_id: profileOrgId
          });

        if (roleError) {
          // If direct insert fails, try RPC as fallback
          console.warn('Direct role insert failed, trying RPC:', roleError);
          const { data: roleData, error: rpcError } = await supabase.rpc("assign_user_role_secure", {
            _target_user_id: user.id,
            _role: "admin",
            _reason: "onboarding_complete",
          });

          if (rpcError) {
            console.error("Failed to assign admin role via RPC:", rpcError);
            return { success: false, error: `Role assignment failed: ${rpcError.message}` };
          }

          const roleResult = roleData as { success: boolean; error?: string } | null;
          if (!roleResult?.success) {
            console.error("Failed to assign admin role:", roleResult?.error);
            return { success: false, error: `Role assignment failed: ${roleResult?.error ?? "Unknown error"}` };
          }
        }
        
        console.log("Admin role successfully assigned to user");
      } catch (error) {
        console.error("Error assigning admin role:", error);
        return { success: false, error: "Failed to assign admin role" };
      }

      // Clean up drafts after successful completion
      try {
        await supabase.rpc('cleanup_user_drafts_on_completion', {
          _user_id: user.id
        });
      } catch (draftError) {
        console.warn('Failed to cleanup drafts:', draftError);
        // Don't fail the completion for draft cleanup issues
      }

      // Refresh onboarding status to reflect completion
      setOnboardingCompleted(true);
      setOnboardingState('completed');
      
      // Force a status refetch to ensure UI updates properly
      setTimeout(() => fetchOnboardingStatus(), 100);
      
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
    onboardingState,
    loading,
    markOnboardingComplete,
    refetch: fetchOnboardingStatus,
  };
}
