
import { toast } from 'sonner';

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
    toast.success(message, {
      duration: options?.duration,
      action: options?.action
    });
  }

  error(message: string, options?: ToastOptions) {
    toast.error(message, {
      duration: options?.duration || 5000,
      action: options?.action
    });
  }

  warning(message: string, options?: ToastOptions) {
    toast.warning(message, {
      duration: options?.duration,
      action: options?.action
    });
  }

  info(message: string, options?: ToastOptions) {
    toast.info(message, {
      duration: options?.duration,
      action: options?.action
    });
  }

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

export const showToast = {
  success: (message: string, options?: ToastOptions) => toastService.success(message, options),
  error: (message: string, options?: ToastOptions) => toastService.error(message, options),
  warning: (message: string, options?: ToastOptions) => toastService.warning(message, options),
  info: (message: string, options?: ToastOptions) => toastService.info(message, options),
};
