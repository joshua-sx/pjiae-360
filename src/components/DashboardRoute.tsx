import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Dashboard from "./Dashboard";
import { usePermissions, type AppRole } from "@/features/access-control/hooks/usePermissions";
import { RouteLoader } from "./ui/navigation-loader";
import { getRolePrefix } from "@/lib/utils";

const allowedRoles: AppRole[] = [
  "admin",
  "director",
  "manager",
  "supervisor",
  "employee"
];

export default function DashboardRoute() {
  const { role } = useParams<{ role?: AppRole }>();
  const navigate = useNavigate();
  const permissions = usePermissions();

  const userRolePrefix = () => {
    if (permissions.isAdmin) return getRolePrefix("admin");
    if (permissions.isDirector) return getRolePrefix("director");
    if (permissions.isManager) return getRolePrefix("manager");
    if (permissions.isSupervisor) return getRolePrefix("supervisor");
    return getRolePrefix("employee");
  };

  const roleValid = role && allowedRoles.includes(role);
  const userHasRole = roleValid ? permissions.hasRole(role as AppRole) : false;

  useEffect(() => {
    if (permissions.loading) return;

    if (!roleValid) {
      navigate("/unauthorized", { replace: true });
      return;
    }

    if (!userHasRole) {
      navigate(`/${userRolePrefix()}/dashboard`, { replace: true });
    }
  }, [permissions.loading, roleValid, userHasRole, navigate]);

  if (permissions.loading) {
    return <RouteLoader />;
  }

  if (!roleValid || !userHasRole) {
    return null;
  }

  return <Dashboard />;
}
