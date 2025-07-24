
import { 
  type LucideIcon, 
  Shield, 
  LayoutDashboard, 
  Target, 
  Star, 
  Users, 
  Calendar,
  ChevronDown, 
  HelpCircle, 
  User,
  LogOut,
  BarChart3,
  Settings,
  Bell,
  ScrollText,
  Building2,
  UserCog,
  RefreshCcw,
  Goal,
  Network,
  FileClock
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { Suspense, useMemo, useState, useEffect } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { usePermissions } from "@/hooks/usePermissions"
import { useRole } from "@/hooks/useRole"
import { AvatarLabelGroup } from "@/components/base/avatar/avatar-label-group"
import { Button } from "@/components/base/buttons/button"
import { Dropdown } from "@/components/base/dropdown/dropdown"
import { NavigationLoader } from "./ui/navigation-loader"
import { useNavigationState } from "./providers/NavigationProvider"

import { useSidebarSync } from "@/hooks/useSidebarSync"

// Get user's highest role for display and URL prefix
const getUserRoleInfo = (permissions: ReturnType<typeof usePermissions>) => {
  if (permissions.isAdmin) return { label: "Admin", prefix: "admin" }
  if (permissions.isDirector) return { label: "Director", prefix: "director" }
  if (permissions.isManager) return { label: "Manager", prefix: "manager" }
  if (permissions.isSupervisor) return { label: "Supervisor", prefix: "supervisor" }
  return { label: "Employee", prefix: "employee" }
}

// Navigation items based on permissions and role
const getNavigationData = (permissions: ReturnType<typeof usePermissions>, rolePrefix: string) => [
  {
    title: "Dashboard",
    url: `/${rolePrefix}/dashboard`,
    icon: "dashboard" as const,
    show: true,
  },
  {
    title: "Organization",
    url: `/${rolePrefix}/organization`,
    icon: "network" as const,
    show: permissions.isAdmin || permissions.isDirector,
  },
  {
    title: "Employees",
    url: `/${rolePrefix}/employees`,
    icon: "users" as const,
    show: permissions.canManageEmployees,
  },
  {
    title: "Appraisal Cycles",
    url: `/${rolePrefix}/cycles`,
    icon: "refresh" as const,
    show: permissions.isAdmin || permissions.isDirector,
  },
  {
    title: "Calendar",
    url: `/${rolePrefix}/calendar`,
    icon: "calendar" as const,
    show: true,
  },
  {
    title: "Goals",
    url: `/${rolePrefix}/goals`,
    icon: "goal" as const,
    show: permissions.canManageGoals || permissions.isEmployee,
  },
  {
    title: "Appraisals",
    url: `/${rolePrefix}/appraisals`,
    icon: "star" as const,
    show: true,
  },
  {
    title: "Analytics",
    url: `/${rolePrefix}/reports`,
    icon: "chart" as const,
    show: permissions.isAdmin || permissions.isDirector,
  },
  {
    title: "Role & Permissions",
    url: `/${rolePrefix}/roles`,
    icon: "userCog" as const,
    show: permissions.isAdmin || permissions.isDirector,
  },
  {
    title: "Audit Log",
    url: `/${rolePrefix}/audit`,
    icon: "fileClock" as const,
    show: permissions.isAdmin || permissions.isDirector,
  },
  {
    title: "Settings",
    url: `/${rolePrefix}/settings`,
    icon: "settings" as const,
    show: permissions.isAdmin || permissions.isDirector,
  },
].filter(item => item.show)

// Icon mapping using Lucide icons
const iconMap = {
  dashboard: () => <LayoutDashboard className="w-4 h-4" />,
  goal: () => <Goal className="w-4 h-4" />,
  star: () => <Star className="w-4 h-4" />,
  calendar: () => <Calendar className="w-4 h-4" />,
  admin: () => <Shield className="w-4 h-4" />,
  users: () => <Users className="w-4 h-4" />,
  chart: () => <BarChart3 className="w-4 h-4" />,
  settings: () => <Settings className="w-4 h-4" />,
  bell: () => <Bell className="w-4 h-4" />,
  scroll: () => <ScrollText className="w-4 h-4" />,
  building: () => <Building2 className="w-4 h-4" />,
  network: () => <Network className="w-4 h-4" />,
  userCog: () => <UserCog className="w-4 h-4" />,
  refresh: () => <RefreshCcw className="w-4 h-4" />,
  fileClock: () => <FileClock className="w-4 h-4" />,
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, signOut } = useAuth()
  const permissions = usePermissions()
  const { hasRole: isAdmin } = useRole('admin')
  const location = useLocation()
  const { setNavigationKey } = useNavigationState()
  
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Sync sidebar state
  useSidebarSync()
  
  // Get user role info and memoize navigation items
  const userRoleInfo = useMemo(() => getUserRoleInfo(permissions), [permissions])
  const navigationItems = useMemo(() => getNavigationData(permissions, userRoleInfo.prefix), [permissions, userRoleInfo.prefix])

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

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to={`/${userRoleInfo.prefix}/dashboard`}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-brand-600 text-sidebar-primary-foreground">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Smartgoals 360</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navigationItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>{userRoleInfo.label}</SidebarGroupLabel>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    tooltip={item.title} 
                    isActive={location.pathname === item.url || (item.title === "Dashboard" && (location.pathname === "/dashboard" || location.pathname === "/admin"))}
                    asChild
                  >
                <Link 
                      to={item.url}
                      onClick={() => handleNavigation(item.url)}
                      onMouseEnter={() => handlePreloadRoute(item.url)}
                    >
                      {iconMap[item.icon]()}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Dropdown.Root>
              <Dropdown.Trigger asChild>
                <Button className="group" variant="secondary" iconTrailing={<ChevronDown />}>
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <span className="text-sm font-semibold">
                        {user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                      </span>
                      <span className="truncate text-xs">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </Button>
              </Dropdown.Trigger>
              
              <Dropdown.Popover align="end" side="top" sideOffset={8}>
                <div className="flex gap-3 border-b border-secondary p-3">
                  <AvatarLabelGroup
                    size="md"
                    src={user?.user_metadata?.avatar_url}
                    title={`${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() || user?.email || 'User'}
                    subtitle={user?.email || ''}
                  />
                </div>
                <Dropdown.Menu>
                  <Dropdown.Section>
                    <Dropdown.Item icon={User}>
                      View profile
                    </Dropdown.Item>
                    <Dropdown.Item icon={HelpCircle}>
                      Support
                    </Dropdown.Item>
                  </Dropdown.Section>
                  <Dropdown.Section>
                    <Dropdown.Item 
                      icon={LogOut} 
                      className="text-destructive hover:text-destructive focus:text-destructive"
                      onClick={signOut}
                    >
                      Log out
                    </Dropdown.Item>
                  </Dropdown.Section>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown.Root>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
