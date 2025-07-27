import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { LoginForm } from "./components/LoginForm";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";

// Simple Dashboard Component
function Dashboard() {
  const { user } = useUser();

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
              <p className="text-sm text-muted-foreground mt-2">
                User ID: {user?.id}
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

// Simple Auth Page Component
function AuthPage({ isSignUp = false }: { isSignUp?: boolean }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <LoginForm defaultSignUp={isSignUp} />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/log-in" 
            element={
              <SignedOut>
                <AuthPage isSignUp={false} />
              </SignedOut>
            } 
          />
          <Route 
            path="/create-account" 
            element={
              <SignedOut>
                <AuthPage isSignUp={true} />
              </SignedOut>
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <SignedIn>
                <Dashboard />
              </SignedIn>
            } 
          />
          
          {/* Default route */}
          <Route 
            path="/" 
            element={
              <>
                <SignedIn>
                  <Navigate to="/dashboard" replace />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/log-in" replace />
                </SignedOut>
              </>
            } 
          />
          
          {/* Catch all other routes */}
          <Route 
            path="*" 
            element={
              <>
                <SignedIn>
                  <Navigate to="/dashboard" replace />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/log-in" replace />
                </SignedOut>
              </>
            } 
          />
        </Routes>
        <Sonner />
      </div>
    </Router>
  );
}

export default App;