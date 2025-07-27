import { ClerkProvider } from "@clerk/clerk-react";

// Check for key in localStorage first, then fallback to env variable
const getClerkKey = () => {
  const storedKey = localStorage.getItem('clerk_publishable_key');
  return storedKey || import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';
};

const CLERK_PUBLISHABLE_KEY = getClerkKey();

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
