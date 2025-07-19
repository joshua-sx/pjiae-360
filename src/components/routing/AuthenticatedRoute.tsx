
import React, { Suspense } from 'react'
import ProtectedRoute from '../ProtectedRoute'
import { RouteLoader } from '../ui/navigation-loader'

interface AuthenticatedRouteProps {
  children: React.ReactNode
}

export function AuthenticatedRoute({ children }: AuthenticatedRouteProps) {
  return (
    <ProtectedRoute>
      <Suspense fallback={<RouteLoader />}>
        {children}
      </Suspense>
    </ProtectedRoute>
  )
}
