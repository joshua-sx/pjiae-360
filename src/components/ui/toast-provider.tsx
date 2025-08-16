import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class ToastService {
  success(message: string, options?: ToastOptions) {
    logger.info(`Toast shown: ${message}`, { action: 'toast_success' });
    toast.success(message, {
      duration: options?.duration,
      action: options?.action
    });
  }

  error(message: string, options?: ToastOptions) {
    logger.warn(`Error toast shown: ${message}`, { action: 'toast_error' });
    toast.error(message, {
      duration: options?.duration || 5000, // Longer duration for errors
      action: options?.action
    });
  }

  warning(message: string, options?: ToastOptions) {
    logger.warn(`Warning toast shown: ${message}`, { action: 'toast_warning' });
    toast.warning(message, {
      duration: options?.duration,
      action: options?.action
    });
  }

  info(message: string, options?: ToastOptions) {
    logger.info(`Info toast shown: ${message}`, { action: 'toast_info' });
    toast.info(message, {
      duration: options?.duration,
      action: options?.action
    });
  }

  // Specialized toast methods
  apiError(message: string = 'Something went wrong. Please try again.') {
    this.error(message, {
      action: {
        label: 'Retry',
        onClick: () => window.location.reload()
      }
    });
  }

  networkError() {
    this.error('Network error. Please check your connection.', {
      duration: 7000,
      action: {
        label: 'Retry',
        onClick: () => window.location.reload()
      }
    });
  }

  authError() {
    this.error('Authentication failed. Please sign in again.', {
      action: {
        label: 'Sign In',
        onClick: () => window.location.href = '/log-in'
      }
    });
  }

  permissionError() {
    this.error('You don\'t have permission to perform this action.');
  }
}

export const toastService = new ToastService();

// Convenience exports for backward compatibility
export const showToast = {
  success: (message: string, options?: ToastOptions) => toastService.success(message, options),
  error: (message: string, options?: ToastOptions) => toastService.error(message, options),
  warning: (message: string, options?: ToastOptions) => toastService.warning(message, options),
  info: (message: string, options?: ToastOptions) => toastService.info(message, options),
};