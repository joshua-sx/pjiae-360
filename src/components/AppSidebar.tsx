import * as React from "react";
import {
  Building2,
  Calendar,
  Target,
  Users,
  BarChart3,
  Settings,
  Shield,
  UserCog,
  ClipboardList,
  Bell,
  FileText,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import { NavUser } from "@/components/nav-user";
import { RoleSwitcher } from "@/components/admin/RoleSwitcher";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";

export function AppSidebar() {
  const { user } = useAuth();
  const { isActualAdmin } = usePermissions();
  const location = useLocation();

  const navigationItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: Building2,
    },
    {
      href: "/goals",
      label: "Goals",
      icon: Target,
    },
    {
      href: "/appraisals",
      label: "Appraisals",
      icon: FileText,
    },
    {
      href: "/reports",
      label: "Reports",
      icon: BarChart3,
    },
    {
      href: "/employees",
      label: "Employees",
      icon: Users,
    },
    {
      href: "/admin/roles",
      label: "Roles",
      icon: Shield,
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Building2 className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">PJIAE Performance</span>
            <span className="truncate text-xs">Management System</span>
          </div>
        </div>
        
        {/* Add role switcher for actual admins */}
        {isActualAdmin && (
          <div className="px-4 py-2">
            <RoleSwitcher />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.href}
                >
                  <NavLink to={item.href}>
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
