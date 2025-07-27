
import React, { Suspense } from 'react'
import ProtectedRoute from '../ProtectedRoute'
import RoleProtectedRoute from '../RoleProtectedRoute'
import { RouteLoader } from '../ui/navigation-loader'
import type { Database } from '@/integrations/supabase/types'

type AppRole = Database['public']['Enums']['app_role']

interface EnhancedRoleProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: AppRole[]
  requiredPermissions?: string[]
}

export function EnhancedRoleProtectedRoute({ 
  children, 
  requiredRoles, 
  requiredPermissions 
}: EnhancedRoleProtectedRouteProps) {
  return (
    <ProtectedRoute>
      <RoleProtectedRoute 
        requiredRoles={requiredRoles} 
        requiredPermissions={requiredPermissions}
      >
        <Suspense fallback={<RouteLoader />}>
          {children}
        </Suspense>
      </RoleProtectedRoute>
    </ProtectedRoute>
  )
}
