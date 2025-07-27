import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OrganizationState {
  id: string | null;
  name: string | null;
  role: string | null;
  isClerkManaged: boolean;
  setOrganization: (id: string | null, name: string | null, role?: string | null) => void;
  clearOrganization: () => void;
  setClerkManaged: (managed: boolean) => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      id: null,
      name: null,
      role: null,
      isClerkManaged: false,
      setOrganization: (id, name, role = null) => set({ id, name, role }),
      clearOrganization: () => set({ id: null, name: null, role: null }),
      setClerkManaged: (managed) => set({ isClerkManaged: managed }),
    }),
    { name: 'active-organization' }
  )
);
