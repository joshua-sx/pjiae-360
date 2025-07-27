interface AppConfig {
  // Environment
  isDevelopment: boolean;
  isProduction: boolean;
  
  // Authentication & Session
  sessionTimeoutMs: number;
  sessionWarningMs: number;
  
  // Rate Limiting
  authMaxAttempts: number;
  authWindowMs: number;
  
  // Debug & Development
  showDebugPanel: boolean;
  enableConsoleLogging: boolean;
  
  // Security
  passwordMinLength: number;
  maxFileUploadSize: number;
  
  // API & Performance
  debounceMs: number;
  apiTimeoutMs: number;
}

// Configuration for the PJIAE Digital Appraisal Platform
const config: AppConfig = {
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Authentication & Session (30 minutes total, 5 minutes warning)
  sessionTimeoutMs: 30 * 60 * 1000,
  sessionWarningMs: 25 * 60 * 1000,
  
  // Rate Limiting (5 attempts per 5 minutes)
  authMaxAttempts: 5,
  authWindowMs: 5 * 60 * 1000,
  
  // Debug & Development
  showDebugPanel: import.meta.env.DEV,
  enableConsoleLogging: import.meta.env.DEV,
  
  // Security
  passwordMinLength: 12,
  maxFileUploadSize: 5 * 1024 * 1024, // 5MB
  
  // API & Performance
  debounceMs: 300,
  apiTimeoutMs: 30 * 1000,
};

export { config };

// Utility functions for common config checks
export const isDevMode = () => config.isDevelopment;
export const isProdMode = () => config.isProduction;
export const shouldShowDebug = () => config.showDebugPanel;
export const shouldEnableLogging = () => config.enableConsoleLogging;