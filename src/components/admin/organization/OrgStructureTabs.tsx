
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Users } from "lucide-react";
import DivisionTab from "./DivisionTab";
import DepartmentTab from "./DepartmentTab";

export function OrgStructureTabs() {
  return (
    <Tabs defaultValue="divisions" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="divisions" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          Divisions
        </TabsTrigger>
        <TabsTrigger value="departments" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Departments
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="divisions">
        <DivisionTab />
      </TabsContent>
      
      <TabsContent value="departments">
        <DepartmentTab />
      </TabsContent>
    </Tabs>
  );
}
