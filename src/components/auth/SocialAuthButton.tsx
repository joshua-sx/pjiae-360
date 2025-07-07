import { Button } from "@/components/ui/button";

interface SocialAuthButtonProps {
  onSocialSignIn: () => void;
}

export function SocialAuthButton({ onSocialSignIn }: SocialAuthButtonProps) {
  return (
    <>
      <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
        <span className="bg-background text-muted-foreground relative z-10 px-2">
          Or continue with
        </span>
      </div>
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          type="button" 
          className="w-full"
          onClick={onSocialSignIn}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4">
            <path
              d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"
              fill="currentColor"
            />
          </svg>
          Continue with Microsoft
        </Button>
      </div>
    </>
  );
}