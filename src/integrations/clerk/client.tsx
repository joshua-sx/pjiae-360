import { ClerkProvider } from "@clerk/clerk-react";

export const CLERK_PUBLISHABLE_KEY = "test_clerk_publishable_key";

interface ClerkProviderProps {
  children: React.ReactNode;
}

export const AppClerkProvider = ({ children }: ClerkProviderProps) => (
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>{children}</ClerkProvider>
);
