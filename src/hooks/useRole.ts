import { AppRole } from './usePermissions'
import { usePermissions } from './usePermissions'

export function useRole(role: AppRole) {
  const { roles, loading } = usePermissions()
  const hasRole = roles.includes(role)
  return { hasRole, loading }
}

