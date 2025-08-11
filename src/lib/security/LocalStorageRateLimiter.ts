// Enhanced rate limiter with localStorage persistence and exponential backoff
export class LocalStorageRateLimiter {
  private storageKey: string;

  constructor(storageKey: string = 'rate_limiter') {
    this.storageKey = storageKey;
  }

  private getStoredData(): Record<string, { attempts: number[]; backoffLevel: number }> {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private saveStoredData(data: Record<string, { attempts: number[]; backoffLevel: number }>): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  }

  async isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 300000): Promise<{ allowed: boolean; waitTimeMs: number; backoffLevel: number }> {
    const now = Date.now();
    const storedData = this.getStoredData();
    const keyData = storedData[key] || { attempts: [], backoffLevel: 0 };
    
    // Remove old attempts outside the window
    const recentAttempts = keyData.attempts.filter(time => now - time < windowMs);
    
    // Calculate exponential backoff wait time
    const baseWaitTime = 60000; // 1 minute base
    const backoffMultiplier = Math.pow(2, keyData.backoffLevel);
    const currentWaitTime = baseWaitTime * backoffMultiplier;
    
    if (recentAttempts.length >= maxAttempts) {
      const lastAttempt = Math.max(...recentAttempts);
      const waitTimeRemaining = Math.max(0, currentWaitTime - (now - lastAttempt));
      
      // Log rate limit violation
      await this.logRateLimitEvent(key, 'rate_limit_exceeded', {
        attempts: recentAttempts.length,
        maxAttempts,
        windowMs,
        backoffLevel: keyData.backoffLevel,
        waitTimeRemaining
      });
      
      return {
        allowed: waitTimeRemaining === 0,
        waitTimeMs: waitTimeRemaining,
        backoffLevel: keyData.backoffLevel
      };
    }
    
    // Allow the attempt and record it
    recentAttempts.push(now);
    
    // Increase backoff level if hitting rate limit
    const newBackoffLevel = recentAttempts.length >= maxAttempts ? keyData.backoffLevel + 1 : keyData.backoffLevel;
    
    storedData[key] = { attempts: recentAttempts, backoffLevel: newBackoffLevel };
    this.saveStoredData(storedData);
    
    // Log successful rate limit check
    if (recentAttempts.length > 1) {
      await this.logRateLimitEvent(key, 'rate_limit_check', {
        attempts: recentAttempts.length,
        maxAttempts,
        allowed: true,
        backoffLevel: newBackoffLevel
      });
    }
    
    return { allowed: true, waitTimeMs: 0, backoffLevel: newBackoffLevel };
  }

  private async logRateLimitEvent(key: string, eventType: string, details: Record<string, any>) {
    try {
      // Dynamic import to avoid circular dependencies
      const { logSecurityEvent } = await import('./events');
      await logSecurityEvent(eventType, {
        rateLimitKey: key,
        ...details
      }, eventType !== 'rate_limit_exceeded');
    } catch (error) {
      console.error('Failed to log rate limit event:', error);
    }
  }

  reset(key: string): void {
    const storedData = this.getStoredData();
    delete storedData[key];
    this.saveStoredData(storedData);
  }

  // Store cooldown state per email for persistence across page reloads
  setCooldown(email: string, seconds: number): void {
    const cooldownKey = `cooldown_${email}`;
    const endTime = Date.now() + (seconds * 1000);
    try {
      sessionStorage.setItem(cooldownKey, endTime.toString());
    } catch {
      // Ignore storage errors
    }
  }

  getCooldownRemaining(email: string): number {
    const cooldownKey = `cooldown_${email}`;
    try {
      const endTimeStr = sessionStorage.getItem(cooldownKey);
      if (!endTimeStr) return 0;
      
      const endTime = parseInt(endTimeStr);
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      
      if (remaining === 0) {
        sessionStorage.removeItem(cooldownKey);
      }
      
      return remaining;
    } catch {
      return 0;
    }
  }
}

export const persistentRateLimiter = new LocalStorageRateLimiter();