import { Link, useLocation } from "react-router-dom";

export function AuthFormFooter() {
  const location = useLocation();
  const isSignUp = location.pathname === "/create-account";

  return (
    <div className="space-y-4">
      {!isSignUp && (
        <div className="text-center">
          <Link 
            to="/forgot-password" 
            className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
          >
            Forgot your password?
          </Link>
        </div>
      )}
      
      <div className="text-muted-foreground text-center text-xs text-balance">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}