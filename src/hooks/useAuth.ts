import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";

export const useAuth = () => {
  const { user, isLoaded: userLoaded } = useUser();
  const { sessionId, signOut, isLoaded: authLoaded } = useClerkAuth();

  const loading = !(userLoaded && authLoaded);

  return {
    user,
    session: sessionId ? { id: sessionId } : null,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
};