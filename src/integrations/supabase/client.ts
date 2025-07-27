// Minimal stub for components that reference Supabase
// This prevents import errors while using Clerk authentication

export const supabase = {
  from: () => ({
    select: () => ({
      eq: () => Promise.resolve({ data: [], error: null, count: 0 }),
      neq: () => Promise.resolve({ data: [], error: null, count: 0 }),
      limit: () => Promise.resolve({ data: [], error: null, count: 0 }),
      order: () => Promise.resolve({ data: [], error: null, count: 0 }),
      single: () => Promise.resolve({ data: null, error: null }),
    }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null }),
    upsert: () => Promise.resolve({ data: [], error: null }),
  }),
  rpc: () => Promise.resolve({ data: [], error: null }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  },
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: null }),
      download: () => Promise.resolve({ data: null, error: null }),
      remove: () => Promise.resolve({ data: null, error: null }),
    }),
  },
};

// Export stub function for compatibility
export const setSupabaseAuth = async (token: string) => {
  // No-op for Clerk-only setup
};