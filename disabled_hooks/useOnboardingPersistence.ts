import { supabase } from "@/integrations/supabase/client";
import { OnboardingData } from "@/components/onboarding/OnboardingTypes";
import { useUser, useOrganizationList } from "@clerk/clerk-react";
import { useClerkOrganization } from "./useClerkOrganization";

export interface SaveOnboardingDataResult {
  success: boolean;
  error?: string;
  organizationId?: string;
  clerkOrganizationId?: string;
}

interface CurrentUser {
  id: string;
  email: string | null;
  user_metadata?: Record<string, any>;
}

const findOrCreateOrganization = async (
  user: CurrentUser, 
  orgName?: string,
  createClerkOrg?: (name: string) => Promise<any>
): Promise<{ supabaseOrgId: string; clerkOrgId?: string }> => {
  if (!user) throw new Error("User not authenticated");

  // Check if user already has a profile with an organization
  const { data: userProfile } = await supabase
    .from("employee_info")
    .select("organization_id, organizations(name, clerk_organization_id)")
    .eq("user_id", user.id)
    .single();

  if (userProfile?.organization_id) {
    return { 
      supabaseOrgId: userProfile.organization_id,
      clerkOrgId: userProfile.organizations?.clerk_organization_id || undefined
    };
  }

  // Create Clerk organization first if function is provided
  let clerkOrgId: string | undefined;
  if (createClerkOrg && orgName) {
    try {
      const clerkResult = await createClerkOrg(orgName);
      if (clerkResult.success && clerkResult.organization) {
        clerkOrgId = clerkResult.organization.id;
      }
    } catch (error) {
      console.warn("Failed to create Clerk organization:", error);
    }
  }

  // Create Supabase organization
  const { data: newOrg, error: createError } = await supabase
    .from("organizations")
    .insert({ 
      name: orgName || "New Organization",
      clerk_organization_id: clerkOrgId
    })
    .select("id")
    .single();

  if (createError) throw new Error(`Failed to create organization: ${createError.message}`);

  // Update user's profile to link to the new organization
  const { error: updateError } = await supabase.from("employee_info").upsert(
    {
      user_id: user.id,
      email: user.email!,
      organization_id: newOrg.id,
      status: "active",
      first_name: user.user_metadata?.first_name || "",
      last_name: user.user_metadata?.last_name || "",
      name: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
    },
    { onConflict: "user_id" }
  );

  if (updateError) {
    console.warn("Failed to update user profile with organization:", updateError.message);
  }

  return { supabaseOrgId: newOrg.id, clerkOrgId };
};

const saveStructure = async (organizationId: string, data: OnboardingData) => {
  if (data.orgStructure.length === 0) return;
  const divisions = data.orgStructure.filter((i) => i.type === "division");
  const departments = data.orgStructure.filter((i) => i.type === "department");

  for (const division of divisions) {
    const { error } = await (supabase as any)
      .from("divisions")
      .insert({ name: division.name, organization_id: organizationId })
      .select()
      .single();
    if (error && !error.message.includes("duplicate")) {
      console.warn(`Failed to save division ${division.name}: ${error.message}`);
    }
  }

  for (const department of departments) {
    let divisionId = null;
    if (department.parent) {
      const { data: div } = await supabase
        .from("divisions")
        .select("id")
        .eq("name", department.parent)
        .eq("organization_id", organizationId)
        .single();
      divisionId = div?.id || null;
    }

    const { error } = await (supabase as any)
      .from("departments")
      .insert({
        name: department.name,
        organization_id: organizationId,
        division_id: divisionId,
      })
      .select()
      .single();
    if (error && !error.message.includes("duplicate")) {
      console.warn(`Failed to save department ${department.name}: ${error.message}`);
    }
  }
};

const saveEmployees = async (organizationId: string, data: OnboardingData) => {
  if (data.employees.length === 0) return;

  const employeesToInsert = data.employees.map((emp) => ({
    name: emp.name,
    email: emp.email,
    organization_id: organizationId,
    status: "pending",
    role: emp.role || "employee",
    department_name: emp.department,
    division_name: emp.division,
  }));

  const { error } = await supabase.from("employee_info").insert(employeesToInsert);
  if (error) {
    console.warn("Failed to save some employees:", error.message);
  }
};

const saveCycles = async (organizationId: string, data: OnboardingData) => {
  if (data.cycles.length === 0) return;

  const cyclesToInsert = data.cycles.map((cycle) => ({
    name: cycle.name,
    start_date: cycle.startDate,
    end_date: cycle.endDate,
    organization_id: organizationId,
    status: "draft",
  }));

  const { error } = await supabase.from("appraisal_cycles").insert(cyclesToInsert);
  if (error) {
    console.warn("Failed to save cycles:", error.message);
  }
};

export const useOnboardingPersistence = () => {
  const { user } = useUser();
  const { createOrganization } = useClerkOrganization();

  const saveOnboardingData = async (data: OnboardingData): Promise<SaveOnboardingDataResult> => {
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    try {
      const currentUser: CurrentUser = {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || null,
        user_metadata: {
          first_name: user.firstName,
          last_name: user.lastName,
          full_name: user.fullName,
        },
      };

      // Create organization (both Clerk and Supabase)
      const { supabaseOrgId, clerkOrgId } = await findOrCreateOrganization(
        currentUser,
        data.orgName,
        createOrganization
      );

      // Save all onboarding data to Supabase
      await Promise.all([
        saveStructure(supabaseOrgId, data),
        saveEmployees(supabaseOrgId, data),
        saveCycles(supabaseOrgId, data),
      ]);

      return {
        success: true,
        organizationId: supabaseOrgId,
        clerkOrganizationId: clerkOrgId,
      };
    } catch (error) {
      console.error("Failed to save onboarding data:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  };

  return { saveOnboardingData };
};