import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthHandlers } from "@/hooks/useAuthHandlers";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { handleSubmit } = useAuthHandlers({
    isSignUp: false,
    email,
    password,
    firstName: "",
    lastName: "",
    setIsLoading,
  });

  const onSubmit = async (e: React.FormEvent) => {
    try {
      await handleSubmit(e);
    } catch (error) {
      const description = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({
        title: "Log In Error",
        description,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Loading..." : "Log In"}
        </Button>
      </form>
    </div>
  );
};

export default Login;

