
import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { DashboardLayout } from '../DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization'

interface Breadcrumb {
  label: string
  href?: string
}

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

// Routes that need wide layout
const WIDE_LAYOUT_ROUTES = [
  '/admin/employees',
  '/admin/reports'
]

// Generate breadcrumbs based on the current route
const generateBreadcrumbs = (pathname: string): Breadcrumb[] => {
  const segments = pathname.split('/').filter(Boolean)
  
  // For dashboard route, don't show any breadcrumbs or just show Dashboard
  if (segments.length === 0 || pathname === '/dashboard') {
    return [{ label: "Dashboard" }]
  }
  
  const breadcrumbs: Breadcrumb[] = []
  
  // Handle admin routes
  if (segments[0] === 'admin') {
    breadcrumbs.push({ label: "Admin", href: "/admin" })
    
    if (segments[1]) {
      const adminPageNames: Record<string, string> = {
        'employees': 'Employee Management',
        'cycles': 'Appraisal Cycles',
        'goals': 'Goals',
        'appraisals': 'Appraisals',
        'reports': 'Reports & Analytics',
        'roles': 'Role & Permission Management',
        'organization': 'Organization Management',
        'audit': 'Audit Log',
        'notifications': 'Notifications',
        'settings': 'Settings'
      }
      
      const pageName = adminPageNames[segments[1]] || segments[1].charAt(0).toUpperCase() + segments[1].slice(1)
      
      if (segments[2]) {
        breadcrumbs.push({ label: pageName, href: `/admin/${segments[1]}` })
        breadcrumbs.push({ label: segments[2].charAt(0).toUpperCase() + segments[2].slice(1) })
      } else {
        breadcrumbs.push({ label: pageName })
      }
    }
  } else {
    // Handle other routes - add Dashboard as first crumb for non-dashboard pages
    breadcrumbs.push({ label: "Dashboard", href: "/dashboard" })
    
    const routeNames: Record<string, string> = {
      'goals': 'Goals',
      'appraisals': 'Appraisals',
      'calendar': 'Calendar',
      'profile': 'Profile'
    }
    
    segments.forEach((segment, index) => {
      const routeName = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      const href = index === segments.length - 1 ? undefined : `/${segments.slice(0, index + 1).join('/')}`
      breadcrumbs.push({ label: routeName, href })
    })
  }
  
  return breadcrumbs
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const { user } = useAuth()
  useCurrentOrganization()
  
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

  const breadcrumbs: Array<{ label: string; href?: string }> = useMemo(() => generateBreadcrumbs(location.pathname), [location.pathname])

  const pageWidth = useMemo(() => {
    if (WIDE_LAYOUT_ROUTES.some(route => location.pathname.startsWith(route))) {
      return 'wide'
    }
    return 'standard'
  }, [location.pathname])

  // For routes that need the sidebar, wrap in DashboardLayout
  if (shouldShowSidebar) {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs} pageWidth={pageWidth}>
        {children}
      </DashboardLayout>
    )
  }

  // For public routes, render children directly
  return <>{children}</>
}
