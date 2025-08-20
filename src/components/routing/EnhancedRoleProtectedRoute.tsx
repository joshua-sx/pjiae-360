
import React, { Suspense } from 'react'
import ProtectedRoute from '../ProtectedRoute'
import RoleProtectedRoute from '../RoleProtectedRoute'
import { RouteLoader } from '../ui/navigation-loader'
import type { Database } from '@/integrations/supabase/types'
import type { Permission } from '@/features/access-control/permissions'

type AppRole = Database['public']['Enums']['app_role']

interface EnhancedRoleProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: AppRole[]
  requiredPermissions?: (Permission | string)[]
  minRole?: AppRole
}

export function EnhancedRoleProtectedRoute({ 
  children, 
  requiredRoles, 
  requiredPermissions,
  minRole
}: EnhancedRoleProtectedRouteProps) {
  return (
    <ProtectedRoute>
      <RoleProtectedRoute 
        requiredRoles={requiredRoles} 
        requiredPermissions={requiredPermissions}
        minRole={minRole}
      >
        <Suspense fallback={<RouteLoader />}>
          {children}
        </Suspense>
      </RoleProtectedRoute>
    </ProtectedRoute>
  )
}
