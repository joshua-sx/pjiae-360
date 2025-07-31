import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { NavigationProvider } from "./NavigationProvider";
import { SidebarStateProvider } from "./SidebarStateProvider";
import { SecurityMonitoringProvider } from "./SecurityMonitoringProvider";

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  const queryClient = React.useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DemoModeProvider>
          <NavigationProvider>
            <SidebarStateProvider>
              <SecurityMonitoringProvider>{children}</SecurityMonitoringProvider>
            </SidebarStateProvider>
          </NavigationProvider>
        </DemoModeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};
