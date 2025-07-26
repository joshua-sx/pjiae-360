import { supabase } from "@/integrations/supabase/client";
import { OnboardingData } from "@/components/onboarding/OnboardingTypes";
import { useAuth } from "./useAuth";

export interface SaveOnboardingDataResult {
  success: boolean;
  error?: string;
  organizationId?: string;
}

interface CurrentUser {
  id: string;
  email: string | null;
  user_metadata?: Record<string, any>;
}

const findOrCreateOrganization = async (user: CurrentUser, orgName?: string): Promise<string> => {
  if (!user) throw new Error("User not authenticated");

  // Check if user already has a profile with an organization
  const { data: userProfile } = await supabase
    .from("employee_info")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (userProfile?.organization_id) {
    return userProfile.organization_id;
  }

  // No organization found for user, create a new one
  const { data: newOrg, error: createError } = await supabase
    .from("organizations")
    .insert({ name: orgName || "New Organization" })
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

  return newOrg.id;
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

const importEmployees = async (organizationId: string, data: OnboardingData) => {
  if (data.people.length === 0) return;

  // Transform the data to match the edge function's expected format
  const { data: result, error } = await supabase.functions.invoke("import-employees", {
    body: {
      orgName: data.orgName,
      people: data.people,
      adminInfo: data.adminInfo,
    },
  });

  if (error) throw new Error(`Failed to import employees: ${error.message}`);

  // Log import results for debugging
  if (result) {
    console.log("Import completed:", result);
    if (result.errors?.length > 0) {
      console.warn("Import errors:", result.errors);
    }
  }
};

const saveAppraisalCycle = async (organizationId: string, userId: string, data: OnboardingData) => {
  if (!data.appraisalCycle) return;

  const cycleData = {
    name: data.appraisalCycle.cycleName,
    frequency: data.appraisalCycle.frequency,
    start_date: data.appraisalCycle.startDate,
    end_date:
      data.appraisalCycle.frequency === "annual"
        ? new Date(
            new Date(data.appraisalCycle.startDate).setFullYear(
              new Date(data.appraisalCycle.startDate).getFullYear() + 1
            )
          )
            .toISOString()
            .split("T")[0]
        : new Date(
            new Date(data.appraisalCycle.startDate).setMonth(
              new Date(data.appraisalCycle.startDate).getMonth() + 6
            )
          )
            .toISOString()
            .split("T")[0],
    organization_id: organizationId,
    created_by: userId,
    status: "active",
  };

  const { data: cycleResult, error: cycleError } = await supabase
    .from("cycles")
    .insert(cycleData)
    .select()
    .single();
  if (cycleError) throw new Error(`Failed to save appraisal cycle: ${cycleError.message}`);

  if (data.appraisalCycle.reviewPeriods && data.appraisalCycle.reviewPeriods.length > 0) {
    const periodInserts = data.appraisalCycle.reviewPeriods.map((p) => ({
      name: p.name,
      start_date: p.startDate.toISOString().split("T")[0],
      end_date: p.endDate.toISOString().split("T")[0],
      cycle_id: cycleResult.id,
      organization_id: organizationId,
      status: "draft",
    }));
    const { error } = await supabase.from("periods").insert(periodInserts);
    if (error) throw new Error(`Failed to save review periods: ${error.message}`);
  }

  if (
    data.appraisalCycle.competencyCriteria?.competencies &&
    data.appraisalCycle.competencyCriteria.competencies.length > 0
  ) {
    const competenciesToInsert = data.appraisalCycle.competencyCriteria.competencies.map((c) => ({
      name: c.name,
      description: c.description,
      organization_id: organizationId,
      is_active: true,
    }));
    const { error } = await supabase.from("competencies").insert(competenciesToInsert);
    if (error) throw new Error(`Failed to save competencies: ${error.message}`);
  }
};

export const useOnboardingPersistence = () => {
  const { user } = useAuth();

  const saveOnboardingData = async (data: OnboardingData): Promise<SaveOnboardingDataResult> => {
    try {
      if (!user) throw new Error("User not authenticated");

      const userId = user.id;
      let organizationId = (user as any).publicMetadata?.organization_id as string | undefined;
      if (!organizationId) {
        organizationId = await findOrCreateOrganization(user, data.orgName);
      }

      if (data.orgName) {
        const { error: orgError } = await supabase
          .from("organizations")
          .update({ name: data.orgName })
          .eq("id", organizationId);
        if (orgError) throw new Error(`Failed to update organization: ${orgError.message}`);
      }

      await saveStructure(organizationId, data);
      await importEmployees(organizationId, data);
      await saveAppraisalCycle(organizationId, userId, data);

      return { success: true, organizationId };
    } catch (error: any) {
      const base = "Failed to save onboarding data. ";
      const message = error?.message.includes("duplicate key")
        ? "Some data already exists. Please check for duplicate entries."
        : error?.message.includes("permission")
          ? "Permission denied. Please contact support."
          : error?.message.includes("network")
            ? "Network error. Please check your connection and try again."
            : error?.message || base;

      console.error("Failed to save onboarding data:", error);
      return { success: false, error: message };
    }
  };

  return { saveOnboardingData };
};
