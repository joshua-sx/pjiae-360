
"use client"

import * as React from "react"
import { Plane } from "lucide-react"
import { Link } from "react-router-dom"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useOrganization } from "@/hooks/useOrganization"
import { useOrganizationStore, selectOrganizationName } from "@/stores"

export function OrganizationSwitcher({
  rolePrefix,
}: {
  rolePrefix: string
}) {
  const { organization, loading } = useOrganization()
  const storedOrgName = useOrganizationStore(selectOrganizationName)

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="h-16 items-center group-data-[collapsible=icon]:!h-12">
            <div>
              <Avatar className="size-8">
                <AvatarFallback className="bg-blue-600 text-white">
                  <Plane className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Loading...</span>
                <span className="truncate text-xs">Professional</span>
              </div>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const organizationName = storedOrgName || organization?.name || 'PJIAE 360 Enterprise'
  const organizationPlan = organization?.subscription_plan || 'Professional'
  const organizationLogo = organization?.logo_url

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild className="h-16 items-center group-data-[collapsible=icon]:!h-12">
          <Link to={`/${rolePrefix}/dashboard`}>
            <Avatar className="size-8">
              <AvatarImage src={organizationLogo} alt={`${organizationName} logo`} />
              <AvatarFallback className="bg-blue-600 text-white">
                <Plane className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{organizationName}</span>
              <span className="truncate text-xs">{organizationPlan}</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
