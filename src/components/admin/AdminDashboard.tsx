import { DashboardLayout } from "@/components/DashboardLayout";
import AdminOrgManagement from "./AdminOrgManagement";

const AdminDashboard = () => {
  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Organization Management" }
      ]}
    >
      <AdminOrgManagement />
    </DashboardLayout>
  );
};

export default AdminDashboard;