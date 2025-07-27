import { useOrganization, useOrganizationList, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useOrganizationStore } from "@/stores/organizationStore";

export const useClerkOrganization = () => {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { organizationList, isLoaded: listLoaded, createOrganization, setActive } = useOrganizationList();
  const { user } = useUser();
  const { setOrganization, clearOrganization } = useOrganizationStore();

  // Sync Clerk organization with local store
  useEffect(() => {
    if (orgLoaded && organization) {
      setOrganization(organization.id, organization.name);
    } else if (orgLoaded && !organization) {
      clearOrganization();
    }
  }, [organization, orgLoaded, setOrganization, clearOrganization]);

  const createNewOrganization = async (name: string) => {
    try {
      const newOrg = await createOrganization({ name });
      if (newOrg) {
        await setActive({ organization: newOrg.id });
        return { success: true, organization: newOrg };
      }
      return { success: false, error: "Failed to create organization" };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  };

  const switchOrganization = async (organizationId: string) => {
    try {
      await setActive({ organization: organizationId });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  };

  return {
    // Current organization
    organization,
    organizationId: organization?.id || null,
    organizationName: organization?.name || null,
    
    // Organization list
    organizationList: organizationList || [],
    
    // Loading states
    isLoaded: orgLoaded && listLoaded,
    
    // Actions
    createOrganization: createNewOrganization,
    switchOrganization,
    
    // User info
    userRole: organization?.membership?.role || null,
    isAdmin: organization?.membership?.role === "admin",
  };
};
