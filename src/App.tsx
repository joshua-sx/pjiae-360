import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { useState } from "react";

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
            <UserButton afterSignOutUrl="/log-in" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Welcome Card */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>✅ Clerk Authentication Working!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  Your authentication system is now successfully running with Clerk.
                </p>
                <div className="text-sm">
                  <p><strong>User:</strong> {user?.fullName || 'No name set'}</p>
                  <p><strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress}</p>
                  <p><strong>User ID:</strong> {user?.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats - Static for now */}
          <Card>
            <CardHeader>
              <CardTitle>Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Ready to create</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appraisals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Ready to start</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">You!</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold">Next Steps</h3>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => alert('Feature coming soon!')}>
              Create Goal
            </Button>
            <Button variant="outline" onClick={() => alert('Feature coming soon!')}>
              Start Appraisal
            </Button>
            <Button variant="outline" onClick={() => alert('Feature coming soon!')}>
              View Reports
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Your foundation is ready! Now you can build features specifically designed for Clerk.
          </p>
        </div>
      </main>
    </div>
  );
}

// Simple Auth Form Component
function SimpleAuthForm({ isSignUp }: { isSignUp: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          {isSignUp ? "Create Account" : "Sign In"}
        </h1>
        <p className="text-muted-foreground">
          {isSignUp ? "Get started with your account" : "Welcome back"}
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Use your existing LoginForm component or Clerk's built-in components
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Simple Auth Page Component
function AuthPage({ isSignUp = false }: { isSignUp?: boolean }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <SimpleAuthForm isSignUp={isSignUp} />
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