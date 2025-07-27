import { ClerkProvider } from "@clerk/clerk-react";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY environment variable");
}

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
