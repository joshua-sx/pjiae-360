import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRolePrefix(role: import("@/features/access-control/hooks/usePermissions").AppRole): string {
  switch (role) {
    case 'admin':
    case 'director':
    case 'manager':
    case 'supervisor':
      return role
    default:
      return 'employee'
  }
}
