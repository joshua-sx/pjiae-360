
import { supabase } from '@/integrations/supabase/client';

export interface StorageBucket {
  id: string;
  name: string;
  public: boolean;
  created_at: string;
  updated_at: string;
}

export interface StorageVerificationResult {
  bucketsExist: boolean;
  orgAssetsPublic: boolean;
  employeeImportsPrivate: boolean;
  policiesConfigured: boolean;
  errors: string[];
}

/**
 * Verify that the required storage buckets exist and are properly configured
 */
export async function verifyStorageBuckets(): Promise<StorageVerificationResult> {
  const result: StorageVerificationResult = {
    bucketsExist: false,
    orgAssetsPublic: false,
    employeeImportsPrivate: false,
    policiesConfigured: false,
    errors: []
  };

  try {
    // Check if buckets exist
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      result.errors.push(`Failed to list buckets: ${bucketsError.message}`);
      return result;
    }

    const orgAssetsBucket = buckets.find(b => b.id === 'org-assets');
    const employeeImportsBucket = buckets.find(b => b.id === 'employee-imports');

    if (!orgAssetsBucket || !employeeImportsBucket) {
      result.errors.push('Required storage buckets not found');
      return result;
    }

    result.bucketsExist = true;
    result.orgAssetsPublic = orgAssetsBucket.public;
    result.employeeImportsPrivate = !employeeImportsBucket.public;

    // Test upload permissions for org-assets (should work for admins)
    try {
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const testPath = `test-${Date.now()}.txt`;
      
      const { error: uploadError } = await supabase.storage
        .from('org-assets')
        .upload(testPath, testFile);
      
      if (!uploadError) {
        // Clean up test file
        await supabase.storage
          .from('org-assets')
          .remove([testPath]);
        
        result.policiesConfigured = true;
      } else {
        result.errors.push(`Upload test failed: ${uploadError.message}`);
      }
    } catch (error) {
      result.errors.push(`Upload test error: ${error}`);
    }

  } catch (error) {
    result.errors.push(`Storage verification failed: ${error}`);
  }

  return result;
}

/**
 * Upload organization asset with proper error handling
 */
export async function uploadOrgAsset(file: File, path: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from('org-assets')
      .upload(path, file, {
        upsert: true,
        cacheControl: '3600'
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('org-assets')
      .getPublicUrl(path);

    return { success: true, url: publicUrl };
  } catch (error) {
    return { success: false, error: `Upload failed: ${error}` };
  }
}

/**
 * Upload employee import file (private bucket)
 */
export async function uploadEmployeeImportFile(file: File, path: string): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from('employee-imports')
      .upload(path, file, {
        upsert: true
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, path: data.path };
  } catch (error) {
    return { success: false, error: `Upload failed: ${error}` };
  }
}

/**
 * Get signed URL for private employee import files
 */
export async function getEmployeeImportSignedUrl(path: string, expiresIn: number = 3600): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from('employee-imports')
      .createSignedUrl(path, expiresIn);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, url: data.signedUrl };
  } catch (error) {
    return { success: false, error: `Failed to create signed URL: ${error}` };
  }
}
