import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helper';
import { OnboardingHelper } from './helpers/onboarding-helper';
import { testOrganizationData } from './fixtures/test-data';

test.describe('Onboarding Draft Recovery', () => {
  let authHelper: AuthHelper;
  let onboardingHelper: OnboardingHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    onboardingHelper = new OnboardingHelper(page);
  });

  test('should save and recover draft automatically', async ({ page }) => {
    const email = `test-draft-${Date.now()}@example.com`;
    
    // Start onboarding
    await authHelper.signUp(email, 'password123', testOrganizationData.name);
    
    // Fill organization details (this should auto-save)
    await onboardingHelper.fillOrganizationDetails();
    await onboardingHelper.selectEntryMethod('manual');
    
    // Wait for auto-save indicator
    await expect(page.locator('[data-testid="save-status-saving"]')).toBeVisible();
    await expect(page.locator('[data-testid="save-status-saved"]')).toBeVisible();
    
    // Simulate page refresh/restart
    await page.reload();
    
    // Should show draft recovery modal
    await expect(page.locator('[data-testid="draft-recovery-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="draft-progress"]')).toContainText('Step 1');
    
    // Resume draft
    await page.click('[data-testid="resume-draft-button"]');
    
    // Should restore data
    await expect(page.locator('[data-testid="organization-name"]')).toHaveValue(testOrganizationData.name);
    await expect(page.locator('[data-testid="entry-method-manual"]')).toBeChecked();
  });

  test('should allow starting fresh instead of resuming', async ({ page }) => {
    const email = `test-fresh-${Date.now()}@example.com`;
    
    // Start onboarding and create draft
    await authHelper.signUp(email, 'password123', testOrganizationData.name);
    await onboardingHelper.fillOrganizationDetails();
    
    // Wait for auto-save
    await expect(page.locator('[data-testid="save-status-saved"]')).toBeVisible();
    
    // Reload page
    await page.reload();
    
    // Choose to start fresh
    await expect(page.locator('[data-testid="draft-recovery-modal"]')).toBeVisible();
    await page.click('[data-testid="start-fresh-button"]');
    
    // Should have clean form
    await expect(page.locator('[data-testid="organization-name"]')).toHaveValue('');
    await expect(page.locator('[data-testid="entry-method-manual"]')).not.toBeChecked();
  });

  test('should show draft progress information', async ({ page }) => {
    const email = `test-progress-${Date.now()}@example.com`;
    
    await authHelper.signUp(email, 'password123', testOrganizationData.name);
    
    // Complete first step
    await onboardingHelper.fillOrganizationDetails();
    await onboardingHelper.selectEntryMethod('manual');
    await onboardingHelper.clickNext();
    
    // Add an employee (partial second step)
    await onboardingHelper.addEmployeeManually();
    
    // Wait for auto-save
    await expect(page.locator('[data-testid="save-status-saved"]')).toBeVisible();
    
    // Reload page
    await page.reload();
    
    // Should show correct progress
    await expect(page.locator('[data-testid="draft-recovery-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="draft-progress"]')).toContainText('Step 2');
    await expect(page.locator('[data-testid="draft-last-saved"]')).toContainText('seconds ago');
    
    // Resume and verify state
    await page.click('[data-testid="resume-draft-button"]');
    
    await onboardingHelper.expectStepActive(2);
    await onboardingHelper.expectStepCompleted(1);
  });

  test('should handle expired drafts gracefully', async ({ page }) => {
    // Mock an expired draft scenario
    await page.addInitScript(() => {
      // Mock localStorage with expired draft
      const expiredDraft = {
        id: 'expired-draft',
        lastSavedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
        currentStep: 1,
        draftData: {
          organization: { name: 'Expired Company' },
          entryMethod: 'manual'
        }
      };
      localStorage.setItem('onboarding_draft', JSON.stringify(expiredDraft));
    });
    
    const email = `test-expired-${Date.now()}@example.com`;
    await authHelper.signUp(email, 'password123', testOrganizationData.name);
    
    // Should not show draft recovery modal for expired draft
    await expect(page.locator('[data-testid="draft-recovery-modal"]')).not.toBeVisible();
    
    // Should start with clean form
    await expect(page.locator('[data-testid="organization-name"]')).toHaveValue('');
  });

  test('should auto-save during typing with debounce', async ({ page }) => {
    const email = `test-autosave-${Date.now()}@example.com`;
    await authHelper.signUp(email, 'password123', testOrganizationData.name);
    
    // Start typing organization name
    await page.fill('[data-testid="organization-name"]', 'Test');
    
    // Should show saving status
    await expect(page.locator('[data-testid="save-status-saving"]')).toBeVisible();
    
    // Continue typing
    await page.fill('[data-testid="organization-name"]', 'Test Company Inc');
    
    // Should eventually show saved status
    await expect(page.locator('[data-testid="save-status-saved"]')).toBeVisible({ timeout: 5000 });
  });

  test('should handle offline/online status', async ({ page }) => {
    const email = `test-offline-${Date.now()}@example.com`;
    await authHelper.signUp(email, 'password123', testOrganizationData.name);
    
    // Go offline
    await page.context().setOffline(true);
    
    // Try to make changes
    await onboardingHelper.fillOrganizationDetails();
    
    // Should show offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="save-status-offline"]')).toBeVisible();
    
    // Go back online
    await page.context().setOffline(false);
    
    // Should sync and show saved status
    await expect(page.locator('[data-testid="save-status-saved"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible();
  });
});