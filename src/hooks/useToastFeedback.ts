import { useToast } from "@/components/ui/use-toast";

export const useToastFeedback = () => {
  const { toast } = useToast();
  return (message: string, type: "success" | "error" = "success") => {
    toast({
      description: message,
      variant: type === "error" ? "destructive" : "default",
    });
  };
};

export type UseToastFeedback = ReturnType<typeof useToastFeedback>;
