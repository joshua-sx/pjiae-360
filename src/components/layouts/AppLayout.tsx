
import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { FeedbackWidget } from "@/components/ui/feedback-widget"
import { TourGuide } from "@/components/ui/tour-guide"
import { useTour } from "@/hooks/useTour"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"

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
  'reports'
]

const tourSteps = [
  {
    target: "[data-tour='sidebar']",
    title: "Navigation Sidebar",
    content: "Access all main features from the sidebar. Use Ctrl+B to toggle it quickly.",
    placement: "right" as const
  },
  {
    target: "[data-tour='dashboard']",
    title: "Dashboard Overview",
    content: "Get a quick overview of your performance metrics and recent activities.",
    placement: "bottom" as const
  },
  {
    target: "[data-tour='goals']",
    title: "Goals Management",
    content: "View and manage your goals. Press 'G' to quickly navigate here.",
    placement: "bottom" as const
  },
  {
    target: "[data-tour='appraisals']",
    title: "Appraisals",
    content: "Access your performance appraisals and reviews. Press 'A' for quick access.",
    placement: "bottom" as const
  }
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
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  useCurrentOrganization()
  
  const { isOpen, startTour, closeTour, completeTour } = useTour({
    steps: tourSteps,
    autoStart: false,
    storageKey: "app-layout-tour"
  })

  useKeyboardShortcuts([
    {
      key: "b",
      ctrlKey: true,
      callback: () => setSidebarOpen(!sidebarOpen),
      description: "Toggle sidebar"
    },
    {
      key: "g",
      callback: () => navigate("/goals"),
      description: "Go to Goals"
    },
    {
      key: "a",
      callback: () => navigate("/appraisals"),
      description: "Go to Appraisals"
    },
    {
      key: "d",
      callback: () => navigate("/dashboard"),
      description: "Go to Dashboard"
    },
    {
      key: "h",
      callback: () => startTour(),
      description: "Start help tour"
    },
    {
      key: "/",
      callback: () => {
        const searchInput = document.querySelector('[data-search]') as HTMLInputElement
        searchInput?.focus()
      },
      description: "Focus search"
    }
  ])
  
  // Scroll to top on route changes for authenticated routes with sidebar
  const shouldScrollToTop = useMemo(() => {
    return !PUBLIC_ROUTES.includes(location.pathname) && 
           !SPECIAL_LAYOUT_ROUTES.some(route => location.pathname.startsWith(route)) && 
           user
  }, [location.pathname, user])
  
  useScrollToTop(shouldScrollToTop ? location.pathname : undefined, { 
    behavior: 'instant',
    debug: process.env.NODE_ENV === 'development'
  })
  
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
      <>
        <DashboardLayout breadcrumbs={breadcrumbs} pageWidth={pageWidth}>
          <div className="animate-fade-in-up">
            {children}
          </div>
        </DashboardLayout>
        <FeedbackWidget />
        <TourGuide
          steps={tourSteps}
          isOpen={isOpen}
          onClose={closeTour}
          onComplete={completeTour}
        />
      </>
    )
  }

  // For public routes, render children directly
  return <>{children}</>
}
