import { config } from '@/lib/config';

// Session timeout management
export class SessionManager {
  private timeoutDuration = config.sessionTimeoutMs;
  private warningDuration = config.sessionWarningMs;
  private timeoutId?: NodeJS.Timeout;
  private warningId?: NodeJS.Timeout;
  
  startTimeout(onWarning: () => void, onTimeout: () => void): void {
    this.clearTimeout();
    
    this.warningId = setTimeout(() => {
      onWarning();
    }, this.warningDuration);
    
    this.timeoutId = setTimeout(() => {
      onTimeout();
    }, this.timeoutDuration);
  }
  
  refreshTimeout(onWarning: () => void, onTimeout: () => void): void {
    this.startTimeout(onWarning, onTimeout);
  }
  
  clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.warningId) {
      clearTimeout(this.warningId);
    }
  }
}

export const sessionManager = new SessionManager();
