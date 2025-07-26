import React, { Suspense } from "react";
import { SignedIn } from "@clerk/clerk-react";
import ProtectedRoute from "../ProtectedRoute";
import RoleProtectedRoute from "../RoleProtectedRoute";
import { RouteLoader } from "../ui/navigation-loader";
import type { AppRole } from "@/types/shared";

interface EnhancedRoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: AppRole[];
  requiredPermissions?: string[];
}

export function EnhancedRoleProtectedRoute({
  children,
  requiredRoles,
  requiredPermissions,
}: EnhancedRoleProtectedRouteProps) {
  return (
    <SignedIn>
      <ProtectedRoute>
        <RoleProtectedRoute requiredRoles={requiredRoles} requiredPermissions={requiredPermissions}>
          <Suspense fallback={<RouteLoader />}>{children}</Suspense>
        </RoleProtectedRoute>
      </ProtectedRoute>
    </SignedIn>
  );
}
