
import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useAuth } from '@/hooks/useAuth'
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { FeedbackWidget } from "@/components/ui/feedback-widget"
import { TourGuide } from "@/components/ui/tour-guide"
import { useTour } from "@/hooks/useTour"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { useNavigationState } from '../providers/NavigationProvider'
import { RouteLoader } from '../ui/navigation-loader'
import { Suspense, useRef, useEffect } from "react"

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

type PageWidth = 'standard' | 'wide' | 'full'

const getContainerClass = (width: PageWidth) => {
  switch (width) {
    case 'wide':
      return 'container-wide'
    case 'full':
      return 'container-full'
    default:
      return 'page-container'
  }
}

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
    
    // For deeper sub-pages (/{role}/{section}/{page}/{action}), show full hierarchy
    if (segments.length === 4) {
      const section = segments[1] // team, personal, etc.
      const page = segments[2] // goals, appraisals, etc.
      const action = segments[3] // new, edit, etc.
      
      const sectionName = section.charAt(0).toUpperCase() + section.slice(1)
      const pageName = pageNames[page] || page.charAt(0).toUpperCase() + page.slice(1)
      const actionName = action === 'new' ? 'Create' : action.charAt(0).toUpperCase() + action.slice(1)
      
      return [
        { label: sectionName },
        { label: pageName, href: `/${role}/${section}/${page}` },
        { label: actionName }
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
  const { open, setOpen } = useSidebar()
  const { isNavigating, navigationKey } = useNavigationState()
  const mainRef = useRef<HTMLElement>(null)
  useCurrentOrganization()
  
  const { isOpen, startTour, closeTour, completeTour } = useTour({
    steps: tourSteps,
    autoStart: false,
    storageKey: "app-layout-tour"
  })

  // Scroll to top when navigation occurs
  useScrollToTop(navigationKey)
  
  useKeyboardShortcuts([
    {
      key: "b",
      ctrlKey: true,
      callback: () => setOpen(!open),
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
  
  // Prevent scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
  }, [])
  
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

  const showLoader = isNavigating

  // For routes that need the sidebar, wrap in SidebarInset
  if (shouldShowSidebar) {
    return (
      <SidebarInset>
        <main ref={mainRef} className="flex-1 overflow-auto mobile-scroll safe-area-bottom" data-sidebar="inset">
          <div className="px-3 sm:px-4 lg:px-6 py-4 border-b">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 tap-target" />
              <Separator orientation="vertical" className="mr-2 h-4 hidden sm:block" />
              <Breadcrumb className="flex-1 min-w-0">
                <BreadcrumbList className="flex-wrap">
                  {breadcrumbs.map((breadcrumb, index) => (
                    <div key={breadcrumb.label} className="flex items-center gap-1 sm:gap-2">
                      <BreadcrumbItem className="flex">
                        {breadcrumb.href ? (
                          <BreadcrumbLink 
                            href={breadcrumb.href} 
                            className="text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base truncate max-w-[120px] sm:max-w-none"
                          >
                            {breadcrumb.label}
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage className="text-foreground text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
                            {breadcrumb.label}
                          </BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator className="hidden xs:block" />
                      )}
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
          <div className="page-container py-4 sm:py-6 lg:py-8">
            {showLoader ? (
              <RouteLoader />
            ) : (
              <Suspense fallback={<RouteLoader />}>
                <div className="animate-fade-in-up">
                  {children}
                </div>
              </Suspense>
            )}
          </div>
        </main>
        <FeedbackWidget />
        <TourGuide
          steps={tourSteps}
          isOpen={isOpen}
          onClose={closeTour}
          onComplete={completeTour}
        />
      </SidebarInset>
    )
  }

  // For public routes, render children directly
  return <>{children}</>
}
