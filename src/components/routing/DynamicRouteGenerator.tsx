import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { EnhancedRoleProtectedRoute } from './EnhancedRoleProtectedRoute';
import { AuthenticatedLayout } from '../layouts/AuthenticatedLayout';
import { routeConfig } from '@/config/routes';
import { componentRegistry } from '@/config/components';

// Layout wrapper that includes authenticated layout
function RoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthenticatedLayout>
      {children}
    </AuthenticatedLayout>
  );
}

// Group routes by their role prefix (first segment)
function groupRoutesByRole() {
  const roleGroups: Record<string, typeof routeConfig> = {};
  
  routeConfig.forEach(route => {
    const pathParts = route.path.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      const rolePrefix = pathParts[0];
      if (!roleGroups[rolePrefix]) {
        roleGroups[rolePrefix] = [];
      }
      roleGroups[rolePrefix].push(route);
    }
  });
  
  return roleGroups;
}

// Extract route path without role prefix
function getRoutePath(fullPath: string) {
  const pathParts = fullPath.split('/').filter(Boolean);
  return pathParts.length > 1 ? pathParts.slice(1).join('/') : '';
}

export function DynamicRouteGenerator() {
  const roleGroups = groupRoutesByRole();

  return (
    <Routes>
      {Object.entries(roleGroups).map(([rolePrefix, routes]) => (
        <Route 
          key={rolePrefix} 
          path={`/${rolePrefix}`} 
          element={<RoleLayout><Outlet /></RoleLayout>}
        >
          {routes.map((route) => {
            const Component = componentRegistry[route.component];
            const routePath = getRoutePath(route.path);
            
            if (!Component) {
              console.warn(`Component ${route.component} not found in componentRegistry`);
              return null;
            }

            return (
              <Route 
                key={route.path}
                path={routePath}
                element={
                  <EnhancedRoleProtectedRoute 
                    requiredRoles={route.roles}
                    requiredPermissions={route.permissions}
                  >
                    <Component />
                  </EnhancedRoleProtectedRoute>
                }
              />
            );
          })}
        </Route>
      ))}
    </Routes>
  );
}