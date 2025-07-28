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
  
  // Supabase (fixed values for this project)
  supabaseUrl: string;
  supabaseAnonKey: string;
}

// Configuration with actual Supabase values (no env vars needed)
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
  passwordMinLength: 6,
  maxFileUploadSize: 5 * 1024 * 1024, // 5MB
  
  // API & Performance
  debounceMs: 300,
  apiTimeoutMs: 30 * 1000,
  
  // Supabase configuration (using actual project values)
  supabaseUrl: 'https://vtmwhvxdgrvaegprmkwg.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bXdodnhkZ3J2YWVncHJta3dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1ODQ3NjcsImV4cCI6MjA2OTE2MDc2N30.9IIWodPo9bE00LXworCekAxWUomhrgX1Nll1jZ94Oyk',
};

export { config };

// Utility functions for common config checks
export const isDevMode = () => config.isDevelopment;
export const isProdMode = () => config.isProduction;
export const shouldShowDebug = () => config.showDebugPanel;
export const shouldEnableLogging = () => config.enableConsoleLogging;