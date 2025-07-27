import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import AuthPage from "./components/AuthPage";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Dashboard } from "./components/Dashboard";

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
                  <RedirectToSignIn />
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