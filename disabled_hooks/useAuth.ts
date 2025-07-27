import { useUser, useAuth as useClerkAuth, useSignIn, useSignUp } from "@clerk/clerk-react";
import { logger } from "@/lib/logger";

export const useAuth = () => {
  const { user, isLoaded: userLoaded } = useUser();
  const { sessionId, signOut, isLoaded: authLoaded } = useClerkAuth();
  const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();

  const loading = !(userLoaded && authLoaded && signInLoaded && signUpLoaded);

  const signUpHandler = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => {
    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });
      if (result.createdSessionId) {
        await setSignUpActive({ session: result.createdSessionId });
      }
      return { data: result, error: null };
    } catch (error) {
      logger.auth.error("SignUp error", error);
      return { data: null, error };
    }
  };

  const signInHandler = async (email: string, password: string) => {
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.createdSessionId) {
        await setSignInActive({ session: result.createdSessionId });
      }
      return { data: result, error: null };
    } catch (error) {
      logger.auth.error("SignIn error", error);
      return { data: null, error };
    }
  };

  const signOutHandler = async () => {
    try {
      await signOut();
      return { error: null };
    } catch (error) {
      logger.auth.error("SignOut error", error);
      return { error };
    }
  };

  return {
    user,
    session: sessionId ? { id: sessionId } : null,
    loading,
    signUp: signUpHandler,
    signIn: signInHandler,
    signOut: signOutHandler,
    isAuthenticated: !!user,
  };
};
