
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";

export default function DivisionTab() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Building className="h-5 w-5" />
          <div>
            <CardTitle>Divisions</CardTitle>
            <CardDescription>
              Manage your organization's divisions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Division management coming soon...</p>
        </div>
      </CardContent>
    </Card>
  );
}
