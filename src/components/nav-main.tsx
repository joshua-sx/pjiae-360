"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  title,
  items,
  onNavigate,
  onPreloadRoute,
}: {
  title: string
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      icon?: LucideIcon
    }[]
  }[]
  onNavigate?: (url: string) => void
  onPreloadRoute?: (url: string) => void
}) {
  const location = useLocation()

  const isNavItemActive = (itemUrl: string, itemTitle: string) => {
    const currentPath = location.pathname
    
    // Special handling for Dashboard
    if (itemTitle === "Dashboard") {
      return currentPath === itemUrl || 
             currentPath === "/dashboard" || 
             currentPath === "/admin"
    }
    
    // For other items, check if current path starts with item URL
    return currentPath === itemUrl || 
           currentPath.startsWith(itemUrl + '/')
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0
          const isActive = isNavItemActive(item.url, item.title)

          if (hasSubItems) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={isActive || item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton 
                            asChild
                            isActive={isNavItemActive(subItem.url, subItem.title)}
                          >
                            <Link 
                              to={subItem.url}
                              onClick={() => onNavigate?.(subItem.url)}
                              onMouseEnter={() => onPreloadRoute?.(subItem.url)}
                              className="flex items-center gap-2"
                            >
                              {subItem.icon && <subItem.icon />}
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                tooltip={item.title} 
                isActive={isActive}
                asChild
              >
                <Link 
                  to={item.url}
                  onClick={() => onNavigate?.(item.url)}
                  onMouseEnter={() => onPreloadRoute?.(item.url)}
                  className="flex items-center gap-2"
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}