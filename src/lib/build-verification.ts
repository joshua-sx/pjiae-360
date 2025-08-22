
import { validateSupabaseTypes, verifyBuildCompatibility } from './supabase-types-generator';
import { verifyStorageBuckets } from './storage-utils';
import { logger } from './logger';

interface BuildVerificationResult {
  typesValid: boolean;
  buildCompatible: boolean;
  storageConfigured: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Comprehensive build and configuration verification
 */
export async function verifyBuildAndConfiguration(): Promise<BuildVerificationResult> {
  const result: BuildVerificationResult = {
    typesValid: false,
    buildCompatible: false,
    storageConfigured: false,
    errors: [],
    warnings: []
  };

  try {
    // Check Supabase types
    const typesResult = await validateSupabaseTypes();
    result.typesValid = typesResult.success;
    if (!typesResult.success) {
      result.errors.push(`Types validation: ${typesResult.message}`);
    }

    // Check build compatibility
    result.buildCompatible = await verifyBuildCompatibility();
    if (!result.buildCompatible) {
      result.errors.push('Build compatibility check failed');
    }

    // Check storage configuration (only if authenticated)
    try {
      const storageResult = await verifyStorageBuckets();
      result.storageConfigured = storageResult.bucketsExist && storageResult.policiesConfigured;
      
      if (storageResult.errors.length > 0) {
        result.warnings.push(...storageResult.errors);
      }
    } catch (error) {
      result.warnings.push(`Storage verification skipped: ${error}`);
    }

    // Log overall status
    const overallStatus = result.typesValid && result.buildCompatible;
    logger.info('Build verification completed', {
      typesValid: result.typesValid,
      buildCompatible: result.buildCompatible,
      storageConfigured: result.storageConfigured,
      overallStatus,
      errorCount: result.errors.length,
      warningCount: result.warnings.length
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Build verification failed: ${errorMessage}`);
    
    logger.error('Build verification failed', {
      error: errorMessage
    });

    return result;
  }
}

/**
 * Quick development check
 */
export async function quickDevCheck(): Promise<void> {
  if (import.meta.env.DEV) {
    console.log('🔍 Running development build verification...');
    
    const result = await verifyBuildAndConfiguration();
    
    if (result.errors.length === 0) {
      console.log('✅ All systems operational');
    } else {
      console.warn('⚠️ Issues detected:', result.errors);
    }
    
    if (result.warnings.length > 0) {
      console.info('ℹ️ Warnings:', result.warnings);
    }
  }
}

// Auto-run in development
if (import.meta.env.DEV) {
  quickDevCheck();
}
