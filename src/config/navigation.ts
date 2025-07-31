import type { LucideIcon } from 'lucide-react';
import {
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
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: AppRole[];
  group: string;
  order?: number;
}

export interface NavigationGroup {
  title: string;
  items: Omit<NavigationItem, 'group' | 'roles'>[];
}

// Icon mapping for navigation items
export const iconMap: Record<string, LucideIcon> = {
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
  target: Target,
};

// Centralized navigation configuration
export const navigationConfig: NavigationItem[] = [
  // Dashboard (all roles)
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: iconMap.dashboard,
    roles: ['admin', 'director', 'manager', 'supervisor', 'employee'],
    group: 'Platform',
    order: 1,
  },

  // Admin navigation items
  {
    title: 'Organization',
    url: '/organization',
    icon: iconMap.network,
    roles: ['admin'],
    group: 'Platform',
    order: 2,
  },
  {
    title: 'Employees',
    url: '/employees',
    icon: iconMap.users,
    roles: ['admin', 'director'],
    group: 'Platform',
    order: 3,
  },
  {
    title: 'Appraisal Cycles',
    url: '/cycles',
    icon: iconMap.refresh,
    roles: ['admin'],
    group: 'Platform',
    order: 4,
  },
  {
    title: 'Calendar',
    url: '/calendar',
    icon: iconMap.calendar,
    roles: ['admin', 'director', 'manager', 'supervisor'],
    group: 'Platform',
    order: 5,
  },
  {
    title: 'Goals',
    url: '/goals',
    icon: iconMap.goal,
    roles: ['admin', 'director', 'employee'],
    group: 'Navigation',
    order: 6,
  },
  {
    title: 'Appraisals',
    url: '/appraisals',
    icon: iconMap.star,
    roles: ['admin', 'director', 'employee'],
    group: 'Navigation',
    order: 7,
  },
  {
    title: 'Analytics',
    url: '/reports',
    icon: iconMap.chart,
    roles: ['admin'],
    group: 'Platform',
    order: 8,
  },
  {
    title: 'Analytics',
    url: '/analytics',
    icon: iconMap.chart,
    roles: ['director', 'manager', 'supervisor'],
    group: 'Analytics',
    order: 8,
  },
  {
    title: 'Role & Permissions',
    url: '/roles',
    icon: iconMap.userCog,
    roles: ['admin'],
    group: 'Platform',
    order: 9,
  },
  {
    title: 'Audit Log',
    url: '/audit',
    icon: iconMap.fileClock,
    roles: ['admin'],
    group: 'Platform',
    order: 10,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: iconMap.settings,
    roles: ['admin'],
    group: 'Platform',
    order: 11,
  },

  // Personal section (managers/supervisors)
  {
    title: 'Goals',
    url: '/personal/goals',
    icon: iconMap.goal,
    roles: ['manager', 'supervisor'],
    group: 'Personal',
    order: 1,
  },
  {
    title: 'Appraisals',
    url: '/personal/appraisals',
    icon: iconMap.star,
    roles: ['manager', 'supervisor'],
    group: 'Personal',
    order: 2,
  },

  // Team section (managers/supervisors)
  {
    title: 'Goals',
    url: '/team/goals',
    icon: iconMap.goal,
    roles: ['manager', 'supervisor'],
    group: 'Team',
    order: 1,
  },
  {
    title: 'Appraisals',
    url: '/team/appraisals',
    icon: iconMap.star,
    roles: ['manager', 'supervisor'],
    group: 'Team',
    order: 2,
  },

  // Employee calendar (separate from other calendars)
  {
    title: 'Calendar',
    url: '/calendar',
    icon: iconMap.calendar,
    roles: ['employee'],
    group: 'Navigation',
    order: 8,
  },
];

// Role-based navigation generator
export const getNavigationForRole = (role: AppRole, rolePrefix: string): NavigationGroup[] => {
  // Filter items accessible to the current role
  const accessibleItems = navigationConfig.filter(item => item.roles.includes(role));

  // Group items by their group property
  const groupedItems = accessibleItems.reduce((acc, item) => {
    const fullUrl = `/${rolePrefix}${item.url}`;
    const groupTitle = item.group;

    const existingGroup = acc.find(g => g.title === groupTitle);
    const navItem = {
      title: item.title,
      url: fullUrl,
      icon: item.icon,
      order: item.order,
    };

    if (existingGroup) {
      existingGroup.items.push(navItem);
    } else {
      acc.push({
        title: groupTitle,
        items: [navItem],
      });
    }

    return acc;
  }, [] as NavigationGroup[]);

  // Sort items within each group by order
  groupedItems.forEach(group => {
    group.items.sort((a, b) => (a.order || 0) - (b.order || 0));
  });

  return groupedItems;
};

// Special handling for employee navigation (simplified structure)
export const getEmployeeNavigation = (rolePrefix: string): NavigationGroup[] => {
  return [
    {
      title: 'Navigation',
      items: [
        {
          title: 'Goals',
          url: `/${rolePrefix}/goals`,
          icon: iconMap.goal,
        },
        {
          title: 'Appraisals',
          url: `/${rolePrefix}/appraisals`,
          icon: iconMap.star,
        },
        {
          title: 'Calendar',
          url: `/${rolePrefix}/calendar`,
          icon: iconMap.calendar,
        },
      ],
    },
  ];
};

// Utility functions
export const getNavigationItemByUrl = (url: string): NavigationItem | undefined => {
  return navigationConfig.find(item => item.url === url);
};

export const getGroupsForRole = (role: AppRole): string[] => {
  const groups = new Set<string>();
  navigationConfig
    .filter(item => item.roles.includes(role))
    .forEach(item => groups.add(item.group));
  return Array.from(groups);
};