
import { useUser, useClerk } from "@clerk/clerk-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { UserButton } from "@clerk/clerk-react";

export function Dashboard() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Performance Appraisal System</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
            </span>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Welcome Card */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Welcome to your Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your performance appraisal system is ready. You're successfully authenticated with Clerk!
              </p>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Active goals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appraisals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Pending appraisals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Active members</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button>Create Goal</Button>
          <Button variant="outline">Start Appraisal</Button>
          <Button variant="outline">View Reports</Button>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
