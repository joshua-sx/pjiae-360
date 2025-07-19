import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { DashboardLayout } from '../DashboardLayout'
import { useAuth } from '@/hooks/useAuth'

interface AppLayoutProps {
  children: React.ReactNode
}

// Routes that should not show the sidebar
const PUBLIC_ROUTES = [
  '/',
  '/log-in',
  '/create-account',
  '/onboarding',
  '/unauthorized'
]

// Special routes that have their own layout
const SPECIAL_LAYOUT_ROUTES = [
  '/onboarding'
]

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const { user } = useAuth()
  
  const shouldShowSidebar = useMemo(() => {
    // Don't show sidebar for public routes
    if (PUBLIC_ROUTES.includes(location.pathname)) {
      return false
    }
    
    // Don't show sidebar for special layout routes
    if (SPECIAL_LAYOUT_ROUTES.some(route => location.pathname.startsWith(route))) {
      return false
    }
    
    // Don't show sidebar if user is not authenticated
    if (!user) {
      return false
    }
    
    // Show sidebar for all other authenticated routes
    return true
  }, [location.pathname, user])

  // For routes that need the sidebar, wrap in DashboardLayout
  if (shouldShowSidebar) {
    return (
      <DashboardLayout>
        {children}
      </DashboardLayout>
    )
  }

  // For public routes, render children directly
  return <>{children}</>
}