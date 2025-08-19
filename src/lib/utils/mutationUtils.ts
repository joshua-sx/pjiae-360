import { useToast } from '@/hooks/use-toast';

export interface MutationErrorHandlerConfig {
  entityName: string;
  operation: 'create' | 'update' | 'delete';
  uniqueConstraintKey?: string;
  customMessages?: {
    uniqueConstraint?: string;
    default?: string;
  };
}

export function createMutationErrorHandler(config: MutationErrorHandlerConfig) {
  const { toast } = useToast();
  
  return (error: any) => {
    const isUniqueConstraint = config.uniqueConstraintKey && 
      error.message.includes(config.uniqueConstraintKey);
    
    let message: string;
    if (isUniqueConstraint && config.customMessages?.uniqueConstraint) {
      message = config.customMessages.uniqueConstraint;
    } else if (isUniqueConstraint) {
      message = `A ${config.entityName} with this name already exists in your organization`;
    } else if (config.customMessages?.default) {
      message = config.customMessages.default.replace('{error}', error.message);
    } else {
      message = `Failed to ${config.operation} ${config.entityName}: ${error.message}`;
    }
    
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  };
}

export function createMutationSuccessHandler(config: {
  entityName: string;
  operation: 'create' | 'update' | 'delete';
  customMessage?: string;
}) {
  const { toast } = useToast();
  
  return (data?: any, variables?: any) => {
    let message: string;
    if (config.customMessage) {
      message = config.customMessage;
    } else {
      const action = config.operation === 'create' ? 'created' : 
                    config.operation === 'update' ? 'updated' : 'deleted';
      const name = data?.name || variables?.name || '';
      message = name 
        ? `${config.entityName} "${name}" ${action} successfully`
        : `${config.entityName} ${action} successfully`;
    }
    
    toast({
      title: 'Success',
      description: message,
    });
  };
}