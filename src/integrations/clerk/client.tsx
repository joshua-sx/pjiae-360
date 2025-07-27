import { ClerkProvider } from "@clerk/clerk-react";

const CLERK_PUBLISHABLE_KEY = 'pk_test_cHJlbWl1bS1vcmlvbGUtMjIuY2xlcmsuYWNjb3VudHMuZGV2JA';

interface ClerkProviderProps {
  children: React.ReactNode;
}

export const AppClerkProvider = ({ children }: ClerkProviderProps) => (
  <ClerkProvider 
    publishableKey={CLERK_PUBLISHABLE_KEY}
    appearance={{
      elements: {
        formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
        card: "shadow-lg",
      },
    }}
  >
    {children}
  </ClerkProvider>
);
