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
  User 
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
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
import { AvatarLabelGroup } from "@/components/base/avatar/avatar-label-group"
import { Button } from "@/components/base/buttons/button"
import { Dropdown } from "@/components/base/dropdown/dropdown"

// Simplified menu items without sub-items - only routes that exist
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: "dashboard" as const,
    },
    {
      title: "Goals",
      url: "/goals",
      icon: "goal" as const,
    },
    {
      title: "Appraisals",
      url: "/appraisals",
      icon: "star" as const,
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: "calendar" as const,
    },
    {
      title: "Admin",
      url: "/admin",
      icon: "admin" as const,
    },
    {
      title: "Employees",
      url: "/admin/employees",
      icon: "users" as const,
    },
  ],
}

// Icon mapping using Lucide icons
const iconMap = {
  dashboard: () => <LayoutDashboard className="w-4 h-4" />,
  goal: () => <Target className="w-4 h-4" />,
  star: () => <Star className="w-4 h-4" />,
  calendar: () => <Calendar className="w-4 h-4" />,
  admin: () => <Shield className="w-4 h-4" />,
  users: () => <Users className="w-4 h-4" />,
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, signOut } = useAuth()
  const location = useLocation()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-brand-600 text-sidebar-primary-foreground">
                  <span className="text-white font-bold text-sm">SG</span>
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
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  tooltip={item.title} 
                  isActive={location.pathname === item.url} 
                  asChild
                >
                  <Link to={item.url}>
                    {iconMap[item.icon]()}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
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
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown.Root>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
