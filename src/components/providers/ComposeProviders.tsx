import React from "react";

export interface ProviderConfig {
  provider: React.ComponentType<any>;
  props?: Record<string, any>;
}

interface ComposeProvidersProps {
  providers: ProviderConfig[];
  children: React.ReactNode;
}

export function ComposeProviders({ providers, children }: ComposeProvidersProps) {
  return providers.reduceRight(
    (acc, config) => {
      const Provider = config.provider;
      return <Provider {...(config.props || {})}>{acc}</Provider>;
    },
    children
  );
}