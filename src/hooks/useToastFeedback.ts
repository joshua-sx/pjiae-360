
import { toast } from "@/hooks/use-toast";

export function useToastFeedback() {
  return (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    toast({
      title: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info',
      description: message,
      variant: type === 'error' ? 'destructive' : 'default'
    });
  };
}
