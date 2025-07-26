import { useAuth as useClerkAuth, useUser, useSignIn, useSignUp } from "@clerk/clerk-react";

export function useAuth() {
  const { isLoaded, isSignedIn, signOut, getToken } = useClerkAuth();
  const { user } = useUser();
  const { isLoaded: signInLoaded, signIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp } = useSignUp();

  const loading = !isLoaded;

  const handleSignUp = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => {
    if (!signUpLoaded) return { data: null, error: new Error("Clerk not loaded") };
    try {
      const result = await signUp.create({ emailAddress: email, password });
      await signUp.update({ firstName, lastName });
      await signUp.attemptEmailAddressVerification();
      return { data: result, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    if (!signInLoaded) return { data: null, error: new Error("Clerk not loaded") };
    try {
      await signIn.create({ identifier: email, password });
      const result = await signIn.attemptFirstFactor({ strategy: "password" });
      return { data: result, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  return {
    user,
    session: null,
    loading,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut,
    isAuthenticated: isSignedIn,
    getToken,
  };
}
