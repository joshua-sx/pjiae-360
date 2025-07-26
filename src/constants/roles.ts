import type { AppRole } from "@/types/shared";

export const CLERK_ROLE_MAP: Record<AppRole, string> = {
  admin: "org:admin",
  director: "org:director",
  manager: "org:manager",
  supervisor: "org:supervisor",
  employee: "org:employee",
};

export function clerkRoleToAppRole(role: string): AppRole | null {
  const entry = Object.entries(CLERK_ROLE_MAP).find(([, value]) => value === role);
  return entry ? (entry[0] as AppRole) : null;
}
