
import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { DashboardLayout } from '../DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization'
import { useScrollToTop } from '@/hooks/useScrollToTop'

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

// Routes that need wide layout - check for any role prefix
const WIDE_LAYOUT_ROUTES = [
  'employees',
  'reports'
]

// Generate breadcrumbs based on the current route
const generateBreadcrumbs = (pathname: string): Breadcrumb[] => {
  const segments = pathname.split('/').filter(Boolean)
  
  // Legacy dashboard routes - just show Dashboard
  if (segments.length === 0 || pathname === '/dashboard' || pathname === '/admin') {
    return [{ label: "Dashboard" }]
  }
  
  // Handle role-based routes (/{role}/{page})
  if (segments.length >= 2) {
    const role = segments[0] // admin, director, manager, supervisor, employee
    const page = segments[1]
    
    const pageNames: Record<string, string> = {
      'dashboard': 'Dashboard',
      'employees': 'Employees',
      'cycles': 'Appraisal Cycles',
      'goals': 'Goals',
      'appraisals': 'Appraisals',
      'calendar': 'Calendar',
      'reports': 'Analytics',
      'roles': 'Role & Permissions',
      'organization': 'Organization',
      'audit': 'Audit Log',
      'notifications': 'Notifications',
      'settings': 'Settings'
    }
    
    // For main pages (/{role}/{page}), just show the page name
    if (segments.length === 2) {
      const pageName = pageNames[page] || page.charAt(0).toUpperCase() + page.slice(1)
      return [{ label: pageName }]
    }
    
    // For sub-pages (/{role}/{page}/{subpage}), show hierarchy
    if (segments.length === 3) {
      const pageName = pageNames[page] || page.charAt(0).toUpperCase() + page.slice(1)
      const subPageName = segments[2].charAt(0).toUpperCase() + segments[2].slice(1)
      return [
        { label: pageName, href: `/${role}/${page}` },
        { label: subPageName }
      ]
    }
  }
  
  // Handle legacy routes - show only the page name
  if (segments.length === 1) {
    const routeNames: Record<string, string> = {
      'goals': 'Goals',
      'appraisals': 'Appraisals',
      'calendar': 'Calendar',
      'profile': 'Profile'
    }
    
    const routeName = routeNames[segments[0]] || segments[0].charAt(0).toUpperCase() + segments[0].slice(1)
    return [{ label: routeName }]
  }
  
  // Fallback - show the last segment as page name
  const lastSegment = segments[segments.length - 1]
  return [{ label: lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) }]
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const { user } = useAuth()
  useCurrentOrganization()
  
  // Scroll to top on route changes for authenticated routes with sidebar
  const shouldScrollToTop = useMemo(() => {
    return !PUBLIC_ROUTES.includes(location.pathname) && 
           !SPECIAL_LAYOUT_ROUTES.some(route => location.pathname.startsWith(route)) && 
           user
  }, [location.pathname, user])
  
  useScrollToTop(shouldScrollToTop ? location.pathname : undefined, { behavior: 'instant' })
  
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
    const segments = location.pathname.split('/').filter(Boolean)
    if (segments.length >= 2 && WIDE_LAYOUT_ROUTES.includes(segments[1])) {
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
