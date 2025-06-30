
import { type LucideIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { UserButton, useUser } from "@clerk/clerk-react"
import { RoleSwitcher } from "@/features/rolePreview/RoleSwitcher";
import { usePreviewSync } from "@/features/rolePreview/hooks/usePreviewSync";

// Simplified menu items without sub-items
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: "📊" as any,
    },
    {
      title: "Team",
      url: "#",
      icon: "👥" as any,
    },
    {
      title: "Goals",
      url: "#",
      icon: "🎯" as any,
    },
    {
      title: "Reviews",
      url: "#",
      icon: "📝" as any,
    },
    {
      title: "Analytics",
      url: "#",
      icon: "📈" as any,
    },
    {
      title: "Settings",
      url: "#",
      icon: "⚙️" as any,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  usePreviewSync();

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">PerformanceHub</h2>
          <RoleSwitcher />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {data.navMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.url}>
                  <span className="mr-2">{item.icon}</span>
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2">
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-8 h-8"
              }
            }}
          />
          <div className="ml-2 text-sm">
            {user?.firstName} {user?.lastName}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
