import { useToast } from '@/hooks/use-toast';

/**
 * Centralized notification hook with common toast patterns
 */
export function useNotifications() {
  const { toast } = useToast();
  
  return {
    success: (message: string, title = 'Success') => 
      toast({ title, description: message }),
    
    error: (message: string, title = 'Error') => 
      toast({ title, description: message, variant: 'destructive' }),
    
    warning: (message: string, title = 'Warning') => 
      toast({ title, description: message, variant: 'destructive' }),
    
    info: (message: string, title = 'Info') => 
      toast({ title, description: message }),
    
    // Common success patterns
    saved: (itemName = 'Item') => 
      toast({ title: 'Success', description: `${itemName} saved successfully` }),
    
    deleted: (itemName = 'Item') => 
      toast({ title: 'Success', description: `${itemName} deleted successfully` }),
    
    updated: (itemName = 'Item') => 
      toast({ title: 'Success', description: `${itemName} updated successfully` }),
    
    created: (itemName = 'Item') => 
      toast({ title: 'Success', description: `${itemName} created successfully` }),
    
    // Common error patterns
    loadError: (itemName = 'data') => 
      toast({ 
        title: 'Error', 
        description: `Failed to load ${itemName}. Please try again.`, 
        variant: 'destructive' 
      }),
    
    saveError: (itemName = 'item') => 
      toast({ 
        title: 'Error', 
        description: `Failed to save ${itemName}. Please try again.`, 
        variant: 'destructive' 
      }),
    
    networkError: () => 
      toast({ 
        title: 'Network Error', 
        description: 'Please check your connection and try again.', 
        variant: 'destructive' 
      }),
    
    permissionError: () => 
      toast({ 
        title: 'Permission Denied', 
        description: 'You do not have permission to perform this action.', 
        variant: 'destructive' 
      }),
  };
}