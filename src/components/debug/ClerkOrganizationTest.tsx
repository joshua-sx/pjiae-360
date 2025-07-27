import { useState } from "react";
import { useClerkOrganization } from "@/hooks/useClerkOrganization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const ClerkOrganizationTest = () => {
  const {
    organization,
    organizationId,
    organizationName,
    organizationList,
    isLoaded,
    createOrganization,
    switchOrganization,
    userRole,
    isAdmin,
  } = useClerkOrganization();

  const [newOrgName, setNewOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) return;
    
    setLoading(true);
    setMessage("");
    
    const result = await createOrganization(newOrgName);
    
    if (result.success) {
      setMessage(`✅ Organization "${newOrgName}" created successfully!`);
      setNewOrgName("");
    } else {
      setMessage(`❌ Failed to create organization: ${result.error}`);
    }
    
    setLoading(false);
  };

  const handleSwitchOrganization = async (orgId: string) => {
    setLoading(true);
    setMessage("");
    
    const result = await switchOrganization(orgId);
    
    if (result.success) {
      setMessage("✅ Organization switched successfully!");
    } else {
      setMessage(`❌ Failed to switch organization: ${result.error}`);
    }
    
    setLoading(false);
  };

  if (!isLoaded) {
    return <div>Loading Clerk organization data...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Organization</CardTitle>
        </CardHeader>
        <CardContent>
          {organization ? (
            <div className="space-y-2">
              <p><strong>ID:</strong> {organizationId}</p>
              <p><strong>Name:</strong> {organizationName}</p>
              <p><strong>Your Role:</strong> <Badge variant="secondary">{userRole}</Badge></p>
              <p><strong>Admin:</strong> {isAdmin ? "✅ Yes" : "❌ No"}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">No organization selected</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create New Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Organization name"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              disabled={loading}
            />
            <Button 
              onClick={handleCreateOrganization}
              disabled={loading || !newOrgName.trim()}
            >
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Organizations ({organizationList.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {organizationList.length > 0 ? (
            <div className="space-y-2">
              {organizationList.map((org) => (
                <div key={org.organization.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{org.organization.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Role: {org.membership.role}
                    </p>
                  </div>
                  <Button
                    variant={org.organization.id === organizationId ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSwitchOrganization(org.organization.id)}
                    disabled={loading || org.organization.id === organizationId}
                  >
                    {org.organization.id === organizationId ? "Current" : "Switch"}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No organizations found</p>
          )}
        </CardContent>
      </Card>

      {message && (
        <Card>
          <CardContent className="pt-6">
            <p className={message.startsWith("✅") ? "text-green-600" : "text-red-600"}>
              {message}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
