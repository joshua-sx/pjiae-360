import { ReactNode } from "react";
import { useSupabaseToken } from "@/hooks/useSupabaseToken";

export const SupabaseTokenProvider = ({ children }: { children: ReactNode }) => {
  useSupabaseToken();
  return <>{children}</>;
};
