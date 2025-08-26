import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface OptimisticMutationOptions<TData, TVariables> {
  // Query key to update optimistically
  queryKey: unknown[];
  // Function to update the cached data optimistically
  updateFn: (oldData: TData | undefined, variables: TVariables) => TData;
  // Mutation function
  mutationFn: (variables: TVariables) => Promise<TData>;
  // Optional success message
  successMessage?: string;
  // Optional error message
  errorMessage?: string;
  // Optional onSuccess callback
  onSuccess?: (data: TData, variables: TVariables) => void;
  // Optional onError callback
  onError?: (error: Error, variables: TVariables) => void;
}

/**
 * Hook for optimistic mutations with automatic rollback on error
 */
export function useOptimisticMutation<TData, TVariables>({
  queryKey,
  updateFn,
  mutationFn,
  successMessage,
  errorMessage,
  onSuccess,
  onError,
}: OptimisticMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TData>(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData<TData>(queryKey, (oldData) => 
        updateFn(oldData, variables)
      );

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to rollback
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData);
      }

      // Show error message
      if (errorMessage) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }

      // Call custom error handler
      onError?.(error as Error, variables);
    },
    onSuccess: (data, variables) => {
      // Show success message
      if (successMessage) {
        toast({
          title: 'Success',
          description: successMessage,
        });
      }

      // Call custom success handler
      onSuccess?.(data, variables);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

/**
 * Hook for simple optimistic updates (add/remove from list)
 */
export function useOptimisticListMutation<TItem, TVariables>({
  queryKey,
  mutationFn,
  addItem,
  removeItem,
  updateItem,
  successMessage,
  errorMessage,
  onSuccess,
  onError,
}: {
  queryKey: unknown[];
  mutationFn: (variables: TVariables) => Promise<TItem>;
  addItem?: (variables: TVariables) => TItem;
  removeItem?: (variables: TVariables) => boolean;
  updateItem?: (oldItem: TItem, variables: TVariables) => TItem;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: TItem[], variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}) {
  return useOptimisticMutation<TItem[], TVariables>({
    queryKey,
    mutationFn: async (variables) => {
      const result = await mutationFn(variables);
      // Return the updated list - in real usage, you'd refetch or construct the new list
      return [result];
    },
    updateFn: (oldData = [], variables) => {
      if (addItem) {
        return [...oldData, addItem(variables)];
      }
      
      if (removeItem) {
        return oldData.filter(() => !removeItem(variables));
      }
      
      if (updateItem) {
        return oldData.map(item => updateItem(item, variables));
      }
      
      return oldData;
    },
    successMessage,
    errorMessage,
    onSuccess,
    onError,
  });
}