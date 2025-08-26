
import { LoadingSpinner as UILoadingSpinner } from "@/components/ui/loading-spinner";

interface LoadingSpinnerProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

export default function LoadingSpinner({ text = "Loading...", size = "md" }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <UILoadingSpinner size={size} />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}
