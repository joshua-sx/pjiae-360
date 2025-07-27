// Simple wrapper for sonner toast
import { toast } from 'sonner';

export const useToast = () => {
  return {
    toast: (options: { title: string; description?: string }) => {
      toast(options.title, { description: options.description });
    },
    toasts: [] // For compatibility with existing Toaster component
  };
};

export { toast };