import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { DemoDataProvider } from "@/contexts/DemoDataContext";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { NavigationProvider } from "./NavigationProvider";
import { SidebarStateProvider } from "./SidebarStateProvider";
import { SecurityMonitoringProvider } from "./SecurityMonitoringProvider";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { createQueryClient } from "@/lib/query-client";
import { QueryClientManager } from "./QueryClientManager";
import { AuthCleanupProvider } from "./AuthCleanupProvider";

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  const queryClient = React.useMemo(() => createQueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <QueryClientManager>
        <AuthCleanupProvider>
          <ThemeProvider defaultTheme="system" storageKey="lovable-ui-theme">
            <PreferencesProvider>
              <TooltipProvider>
                <DemoModeProvider>
                  <DemoDataProvider>
                    <NavigationProvider>
                      <SidebarStateProvider>
                        <SecurityMonitoringProvider>{children}</SecurityMonitoringProvider>
                      </SidebarStateProvider>
                    </NavigationProvider>
                  </DemoDataProvider>
                </DemoModeProvider>
              </TooltipProvider>
            </PreferencesProvider>
          </ThemeProvider>
        </AuthCleanupProvider>
      </QueryClientManager>
    </QueryClientProvider>
  );
};
