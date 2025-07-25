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
  
  // Supabase
  supabaseUrl: string;
  supabaseAnonKey: string;
}

// Default configuration values
const DEFAULT_CONFIG: Omit<AppConfig, 'supabaseUrl' | 'supabaseAnonKey'> = {
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

function createConfig(): AppConfig {
  // Validate required environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set');
  }

  return {
    ...DEFAULT_CONFIG,
    supabaseUrl,
    supabaseAnonKey,
    
    // Override defaults with environment variables if available
    sessionTimeoutMs: Number(import.meta.env.VITE_SESSION_TIMEOUT_MS) || DEFAULT_CONFIG.sessionTimeoutMs,
    sessionWarningMs: Number(import.meta.env.VITE_SESSION_WARNING_MS) || DEFAULT_CONFIG.sessionWarningMs,
    authMaxAttempts: Number(import.meta.env.VITE_AUTH_MAX_ATTEMPTS) || DEFAULT_CONFIG.authMaxAttempts,
    authWindowMs: Number(import.meta.env.VITE_AUTH_WINDOW_MS) || DEFAULT_CONFIG.authWindowMs,
    showDebugPanel: import.meta.env.VITE_SHOW_DEBUG_PANEL === 'true' || DEFAULT_CONFIG.showDebugPanel,
    enableConsoleLogging: import.meta.env.VITE_ENABLE_CONSOLE_LOGGING === 'true' || DEFAULT_CONFIG.enableConsoleLogging,
    passwordMinLength: Number(import.meta.env.VITE_PASSWORD_MIN_LENGTH) || DEFAULT_CONFIG.passwordMinLength,
    maxFileUploadSize: Number(import.meta.env.VITE_MAX_FILE_UPLOAD_SIZE) || DEFAULT_CONFIG.maxFileUploadSize,
    debounceMs: Number(import.meta.env.VITE_DEBOUNCE_MS) || DEFAULT_CONFIG.debounceMs,
    apiTimeoutMs: Number(import.meta.env.VITE_API_TIMEOUT_MS) || DEFAULT_CONFIG.apiTimeoutMs,
  };
}

export const config = createConfig();

// Utility functions for common config checks
export const isDevMode = () => config.isDevelopment;
export const isProdMode = () => config.isProduction;
export const shouldShowDebug = () => config.showDebugPanel;
export const shouldEnableLogging = () => config.enableConsoleLogging;