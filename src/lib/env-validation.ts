/**
 * Environment validation utilities for production readiness
 */

interface EnvConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  NODE_ENV: string;
}

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY'
] as const;

export function validateEnvironment(): EnvConfig {
  const missing: string[] = [];
  const config: Partial<EnvConfig> = {};

  // Get configuration from hardcoded values (since VITE_* not supported)
  const hardcodedConfig: Record<string, string> = {
    'SUPABASE_URL': 'https://vtmwhvxdgrvaegprmkwg.supabase.co',
    'SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bXdodnhkZ3J2YWVncHJta3dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1ODQ3NjcsImV4cCI6MjA2OTE2MDc2N30.9IIWodPo9bE00LXworCekAxWUomhrgX1Nll1jZ94Oyk'
  };

  // Validate required environment variables
  for (const envVar of requiredEnvVars) {
    const value = hardcodedConfig[envVar];
    
    if (!value) {
      missing.push(envVar);
    } else {
      config[envVar] = value;
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Set NODE_ENV default
  config.NODE_ENV = import.meta.env?.NODE_ENV || 'development';

  return config as EnvConfig;
}

export function isDevelopment(): boolean {
  return import.meta.env?.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return import.meta.env?.NODE_ENV === 'production';
}

export function getSupabaseConfig() {
  const env = validateEnvironment();
  return {
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY
  };
}