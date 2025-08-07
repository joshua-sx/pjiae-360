"use client"

import * as React from "react"
import { useMemo, useState, useEffect } from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { OrganizationSwitcher } from "@/components/organization-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavigationLoader } from "./ui/navigation-loader"
import { DemoRoleSelectionModal } from "@/components/ui/demo-role-selection-modal"
import { DemoRoleCombobox } from "@/components/ui/demo-role-combobox"

import { useAuth } from "@/hooks/useAuth"
import { usePermissions } from "@/hooks/usePermissions"
import { useRole } from "@/hooks/useRole"
import { useDemoMode } from "@/contexts/DemoModeContext"
import { useOrganization } from "@/hooks/useOrganization"
import { useNavigationState } from "./providers/NavigationProvider"
import { useSidebarSync } from "@/hooks/useSidebarSync"

// Import navigation configuration
import { getNavigationForRole, getEmployeeNavigation } from "@/config/navigation"

// Get user's highest role for display and URL prefix
const getUserRoleInfo = (permissions: ReturnType<typeof usePermissions>) => {
  if (permissions.isAdmin) return { displayName: "Admin", label: "admin", prefix: "admin" }
  if (permissions.isDirector) return { displayName: "Director", label: "director", prefix: "director" }
  if (permissions.isManager) return { displayName: "Manager", label: "manager", prefix: "manager" }
  if (permissions.isSupervisor) return { displayName: "Supervisor", label: "supervisor", prefix: "supervisor" }
  return { displayName: "Employee", label: "employee", prefix: "employee" }
}

// Get navigation data using configuration
const getNavigationData = (permissions: ReturnType<typeof usePermissions>, rolePrefix: string) => {
  // Determine the primary role for navigation
  let primaryRole: 'admin' | 'director' | 'manager' | 'supervisor' | 'employee' = 'employee';
  
  if (permissions.isAdmin) primaryRole = 'admin';
  else if (permissions.isDirector) primaryRole = 'director';
  else if (permissions.isManager) primaryRole = 'manager';
  else if (permissions.isSupervisor) primaryRole = 'supervisor';

  // Use configuration-based navigation
  const isEmployee = permissions.isEmployee && !permissions.isManager && !permissions.isSupervisor && !permissions.isDirector && !permissions.isAdmin;
  
  if (isEmployee) {
    return getEmployeeNavigation(rolePrefix);
  }
  
  return getNavigationForRole(primaryRole, rolePrefix);
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, signOut } = useAuth()
  const permissions = usePermissions()
  const { hasRole: isAdmin } = useRole('admin')
  const { isDemoMode, demoRole } = useDemoMode()
  const { setNavigationKey } = useNavigationState()
  const { organization: orgData } = useOrganization()
  
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
    setNavigationKey(`${url}-${Date.now()}`)
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
    name: orgData?.name || "PJIAE 360",
    plan: orgData?.subscription_plan || "Enterprise"
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
        <OrganizationSwitcher 
          organization={organizationData}
          rolePrefix={userRoleInfo.prefix}
        />
      </SidebarHeader>
      <SidebarContent>
        {isDemoMode && (
          <SidebarMenu className="mb-2">
            <SidebarMenuItem>
              <DemoRoleCombobox />
            </SidebarMenuItem>
          </SidebarMenu>
        )}
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