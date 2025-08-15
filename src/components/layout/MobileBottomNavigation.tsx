import { useState, useEffect } from "react";
import { Home, Users, Target, BarChart3, Settings, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useMobileResponsive } from "@/hooks/use-mobile-responsive";
import { usePermissions } from "@/hooks/usePermissions";
import { useSidebar } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

interface BottomNavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: number;
  requiresRole?: string[];
}

export function MobileBottomNavigation() {
  const { isMobile } = useMobileResponsive();
  const location = useLocation();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { toggleSidebar } = useSidebar();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 10);
      setLastScrollY(currentScrollY);
    };

    if (isMobile) {
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [lastScrollY, isMobile]);

  // Don't render if not mobile
  if (!isMobile) return null;

  // Get role-specific navigation items
  const getNavigationItems = (): BottomNavItem[] => {
    const baseItems: BottomNavItem[] = [
      {
        icon: Home,
        label: "Dashboard",
        href: permissions.isAdmin 
          ? "/admin/dashboard" 
          : permissions.isDirector 
            ? "/director/dashboard"
            : permissions.isManager 
              ? "/manager/dashboard" 
              : "/employee/dashboard"
      }
    ];

    if (permissions.isAdmin) {
      return [
        ...baseItems,
        { icon: Users, label: "Employees", href: "/admin/employees" },
        { icon: Target, label: "Cycles", href: "/admin/cycles" },
        { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
      ];
    }

    if (permissions.isDirector) {
      return [
        ...baseItems,
        { icon: Target, label: "Goals", href: "/director/goals" },
        { icon: Users, label: "Team", href: "/director/team" },
        { icon: BarChart3, label: "Analytics", href: "/director/analytics" },
      ];
    }

    if (permissions.isManager) {
      return [
        ...baseItems,
        { icon: Target, label: "Goals", href: "/manager/goals" },
        { icon: Users, label: "Team", href: "/manager/team" },
        { icon: BarChart3, label: "Reports", href: "/manager/reports" },
      ];
    }

    // Employee view
    return [
      ...baseItems,
      { icon: Target, label: "Goals", href: "/employee/goals" },
      { icon: BarChart3, label: "Progress", href: "/employee/progress" },
    ];
  };

  const navigationItems = getNavigationItems();

  // Add menu item for sidebar access
  const allItems: (BottomNavItem | { icon: typeof Menu; label: string; action: () => void })[] = [
    ...navigationItems,
    {
      icon: Menu,
      label: "Menu",
      action: () => toggleSidebar()
    }
  ];

  const isActiveRoute = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border transition-transform duration-300 md:hidden",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <nav className="flex items-center justify-around px-2 py-2 max-w-screen-sm mx-auto">
        {allItems.map((item, index) => {
          const isActive = "href" in item ? isActiveRoute(item.href) : false;
          
          return (
            <button
              key={index}
              onClick={() => {
                if ("href" in item) {
                  navigate(item.href);
                } else {
                  item.action();
                }
              }}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-colors relative",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {"badge" in item && item.badge && item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center min-w-[16px]"
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium mt-1 truncate">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}