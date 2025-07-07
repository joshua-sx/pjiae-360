import { useNavigate } from "react-router-dom";

interface AuthFormToggleProps {
  isSignUp: boolean;
}

export function AuthFormToggle({ isSignUp }: AuthFormToggleProps) {
  const navigate = useNavigate();

  return (
    <div className="text-center text-sm">
      {isSignUp ? "Already have an account? " : "Don't have an account? "}
      <button
        type="button"
        onClick={() => {
          if (isSignUp) {
            navigate("/log-in");
          } else {
            navigate("/create-account");
          }
        }}
        className="underline underline-offset-4 hover:text-primary"
      >
        {isSignUp ? "Log in" : "Sign up"}
      </button>
    </div>
  );
}