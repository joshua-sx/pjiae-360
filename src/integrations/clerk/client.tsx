import { ClerkProvider } from "@clerk/clerk-react";
import { createContext, useContext, useState, useEffect } from "react";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_cHJlbWl1bS1vcmlvbGUtMjIuY2xlcmsuYWNjb3VudHMuZGV2JA';

interface ClerkProviderProps {
  children: React.ReactNode;
}

// Context for tracking Clerk load status
const ClerkLoadContext = createContext<{ loaded: boolean; error: boolean }>({ loaded: false, error: false });

export const useClerkLoadStatus = () => useContext(ClerkLoadContext);

export const AppClerkProvider = ({ children }: ClerkProviderProps) => {
  const [loadStatus, setLoadStatus] = useState({ loaded: false, error: false });

  useEffect(() => {
    // Set a timeout to detect if Clerk fails to load
    const timeout = setTimeout(() => {
      setLoadStatus({ loaded: false, error: true });
    }, 5000);

    // Listen for successful Clerk initialization
    const checkClerk = () => {
      if ((window as any).Clerk) {
        clearTimeout(timeout);
        setLoadStatus({ loaded: true, error: false });
      }
    };

    checkClerk();
    const interval = setInterval(checkClerk, 100);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <ClerkLoadContext.Provider value={loadStatus}>
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
    </ClerkLoadContext.Provider>
  );
};
