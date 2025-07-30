"use client"

import * as React from "react"
import {
  type LucideIcon,
  Shield,
  LayoutDashboard,
  Target,
  Star,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Bell,
  ScrollText,
  Building2,
  UserCog,
  RefreshCcw,
  Goal,
  Network,
  FileClock,
  User,
} from "lucide-react"
import { useMemo, useState, useEffect } from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavigationLoader } from "./ui/navigation-loader"
import { DemoRoleSelectionModal } from "@/components/ui/demo-role-selection-modal"

import { useAuth } from "@/hooks/useAuth"
import { usePermissions } from "@/hooks/usePermissions"
import { useRole } from "@/hooks/useRole"
import { useDemoMode } from "@/contexts/DemoModeContext"
import { useNavigationState } from "./providers/NavigationProvider"
import { useSidebarSync } from "@/hooks/useSidebarSync"

// Get user's highest role for display and URL prefix
const getUserRoleInfo = (permissions: ReturnType<typeof usePermissions>) => {
  if (permissions.isAdmin) return { displayName: "Admin", label: "admin", prefix: "admin" }
  if (permissions.isDirector) return { displayName: "Director", label: "director", prefix: "director" }
  if (permissions.isManager) return { displayName: "Manager", label: "manager", prefix: "manager" }
  if (permissions.isSupervisor) return { displayName: "Supervisor", label: "supervisor", prefix: "supervisor" }
  return { displayName: "Employee", label: "employee", prefix: "employee" }
}

// Navigation items based on permissions and role
const getNavigationData = (permissions: ReturnType<typeof usePermissions>, rolePrefix: string) => {
  const isEmployee = permissions.isEmployee && !permissions.isManager && !permissions.isSupervisor && !permissions.isDirector && !permissions.isAdmin;
  const isAdmin = permissions.isAdmin;
  const isDirector = permissions.isDirector;
  const hasTeamAccess = permissions.isManager || permissions.isSupervisor || permissions.isDirector;

  // Icon mapping for navigation items
  const iconMap: Record<string, LucideIcon> = {
    dashboard: LayoutDashboard,
    goal: Goal,
    star: Star,
    calendar: Calendar,
    admin: Shield,
    users: Users,
    chart: BarChart3,
    settings: Settings,
    bell: Bell,
    scroll: ScrollText,
    building: Building2,
    network: Network,
    userCog: UserCog,
    refresh: RefreshCcw,
    fileClock: FileClock,
    user: User,
  }

  // Employee navigation (simple structure)
  if (isEmployee) {
    return [
      {
        title: "Navigation",
        items: [
          {
            title: "Goals",
            url: `/${rolePrefix}/goals`,
            icon: iconMap.goal,
          },
          {
            title: "Appraisals",
            url: `/${rolePrefix}/appraisals`,
            icon: iconMap.star,
          },
          {
            title: "Calendar",
            url: `/${rolePrefix}/calendar`,
            icon: iconMap.calendar,
          },
        ]
      }
    ];
  }

  // Admin navigation (flat structure)
  if (isAdmin || isDirector) {
    const adminItems = [
      {
        title: "Dashboard",
        url: `/${rolePrefix}/dashboard`,
        icon: iconMap.dashboard,
      },
      {
        title: "Organization",
        url: `/${rolePrefix}/organization`,
        icon: iconMap.network,
      },
      {
        title: "Employees",
        url: `/${rolePrefix}/employees`,
        icon: iconMap.users,
      },
      {
        title: "Appraisal Cycles",
        url: `/${rolePrefix}/cycles`,
        icon: iconMap.refresh,
      },
      {
        title: "Calendar",
        url: `/${rolePrefix}/calendar`,
        icon: iconMap.calendar,
      },
      {
        title: "Goals",
        url: `/${rolePrefix}/goals`,
        icon: iconMap.goal,
      },
      {
        title: "Appraisals",
        url: `/${rolePrefix}/appraisals`,
        icon: iconMap.star,
      },
      {
        title: "Analytics",
        url: `/${rolePrefix}/reports`,
        icon: iconMap.chart,
      },
      {
        title: "Role & Permissions",
        url: `/${rolePrefix}/roles`,
        icon: iconMap.userCog,
      },
      {
        title: "Audit Log",
        url: `/${rolePrefix}/audit`,
        icon: iconMap.fileClock,
      },
      {
        title: "Settings",
        url: `/${rolePrefix}/settings`,
        icon: iconMap.settings,
      },
    ];

    return [
      {
        title: "Platform",
        items: adminItems
      }
    ];
  }

  // Supervisor & Manager navigation (grouped structure with collapsible sections)
  return [
    {
      title: "Personal",
      items: [
        {
          title: "Goals",
          url: `/${rolePrefix}/personal/goals`,
          icon: iconMap.goal,
        },
        {
          title: "Appraisals",
          url: `/${rolePrefix}/personal/appraisals`,
          icon: iconMap.star,
        },
      ]
    },
    {
      title: "Team",
      items: [
        {
          title: "Goals",
          url: `/${rolePrefix}/team/goals`,
          icon: iconMap.goal,
        },
        {
          title: "Appraisals",
          url: `/${rolePrefix}/team/appraisals`,
          icon: iconMap.star,
        },
      ]
    },
    {
      title: "Analytics",
      items: [
        {
          title: "Analytics",
          url: `/${rolePrefix}/analytics`,
          icon: iconMap.chart,
        },
        {
          title: "Calendar",
          url: `/${rolePrefix}/calendar`,
          icon: iconMap.calendar,
        },
      ]
    }
  ];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, signOut } = useAuth()
  const permissions = usePermissions()
  const { hasRole: isAdmin } = useRole('admin')
  const { isDemoMode, demoRole } = useDemoMode()
  const { setNavigationKey } = useNavigationState()
  
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Sync sidebar state
  useSidebarSync()
  
  // Get user role info and memoize navigation items (use demo role if in demo mode)
  const effectivePermissions = isDemoMode ? { 
    ...permissions, 
    isAdmin: demoRole === 'admin',
    isDirector: demoRole === 'director', 
    isManager: demoRole === 'manager',
    isSupervisor: demoRole === 'supervisor',
    isEmployee: demoRole === 'employee'
  } : permissions;
  
  const userRoleInfo = useMemo(() => getUserRoleInfo(effectivePermissions), [effectivePermissions])
  const navigationData = useMemo(() => getNavigationData(effectivePermissions, userRoleInfo.prefix), [effectivePermissions, userRoleInfo.prefix])

  // Set loaded state after permissions are available
  useEffect(() => {
    if (!permissions.loading) {
      setIsLoaded(true)
    }
  }, [permissions.loading])

  const handleNavigation = (url: string) => {
    setNavigationKey(url)
  }

  const handlePreloadRoute = (url: string) => {
    // Preload route on hover
    import(`../pages${url.replace('/admin', '/admin')}`).catch(() => {
      // Route doesn't exist or not lazy loaded, ignore
    })
  }

  if (!user || !isLoaded || permissions.loading) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <NavigationLoader />
        </SidebarHeader>
        <SidebarContent>
          <NavigationLoader />
        </SidebarContent>
      </Sidebar>
    )
  }

  // Prepare organization data for TeamSwitcher
  const organizationData = {
    name: "Smartgoals 360",
    plan: "Enterprise"
  }

  // Prepare user data for NavUser
  const userData = {
    name: `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() || 'User',
    email: user?.email || '',
    initials: user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher 
          organization={organizationData}
          rolePrefix={userRoleInfo.prefix}
          isDemoMode={isDemoMode}
        />
      </SidebarHeader>
      <SidebarContent>
        {navigationData.map((section) => (
          <NavMain
            key={section.title}
            title={section.title}
            items={section.items}
            onNavigate={handleNavigation}
            onPreloadRoute={handlePreloadRoute}
          />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} onSignOut={signOut} />
      </SidebarFooter>
      <SidebarRail />
      
      <DemoRoleSelectionModal />
    </Sidebar>
  )
}