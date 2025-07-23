import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OrganizationState {
  id: string | null;
  name: string | null;
  setOrganization: (id: string | null, name: string | null) => void;
  clearOrganization: () => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      id: null,
      name: null,
      setOrganization: (id, name) => set({ id, name }),
      clearOrganization: () => set({ id: null, name: null }),
    }),
    { name: 'active-organization' }
  )
);
