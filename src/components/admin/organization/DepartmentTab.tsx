
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function DepartmentTab() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5" />
          <div>
            <CardTitle>Departments</CardTitle>
            <CardDescription>
              Manage your organization's departments
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Department management coming soon...</p>
        </div>
      </CardContent>
    </Card>
  );
}
