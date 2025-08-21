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
import { ComposeProviders } from "./ComposeProviders";
import { OrganizationGuard } from "@/components/guards/OrganizationGuard";

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  const queryClient = React.useMemo(() => createQueryClient(), []);

  const providers = [
    { provider: QueryClientProvider, props: { client: queryClient } },
    { provider: QueryClientManager },
    { provider: AuthCleanupProvider },
    { provider: ThemeProvider, props: { defaultTheme: "system", storageKey: "lovable-ui-theme" } },
    { provider: PreferencesProvider },
    { provider: TooltipProvider },
    { provider: DemoModeProvider },
    { provider: DemoDataProvider },
    { provider: NavigationProvider },
    { provider: SidebarStateProvider },
    { provider: SecurityMonitoringProvider }
  ];

  return <ComposeProviders providers={providers}>{children}</ComposeProviders>;
};
