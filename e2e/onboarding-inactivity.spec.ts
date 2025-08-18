import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helper';
import { OnboardingHelper } from './helpers/onboarding-helper';
import { testOrganizationData } from './fixtures/test-data';

test.describe('Onboarding Inactivity', () => {
  let authHelper: AuthHelper;
  let onboardingHelper: OnboardingHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    onboardingHelper = new OnboardingHelper(page);
  });

  test('should show inactivity modal after timeout', async ({ page }) => {
    const email = `test-inactivity-${Date.now()}@example.com`;
    await authHelper.signUp(email, 'password123', testOrganizationData.name);
    
    // Fill some data to create a draft
    await onboardingHelper.fillOrganizationDetails();
    
    // Wait for auto-save
    await expect(page.locator('[data-testid="save-status-saved"]')).toBeVisible();
    
    // Reduce inactivity timeout for testing (inject script to override)
    await page.addInitScript(() => {
      window.INACTIVITY_TIMEOUT = 3000; // 3 seconds for testing
    });
    
    // Wait for inactivity timeout (no user interaction)
    await page.waitForTimeout(4000);
    
    // Should show inactivity modal
    await expect(page.locator('[data-testid="inactivity-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="inactivity-message"]')).toContainText('draft has been saved');
  });

  test('should reset timer on user activity', async ({ page }) => {
    const email = `test-activity-${Date.now()}@example.com`;
    await authHelper.signUp(email, 'password123', testOrganizationData.name);
    
    await onboardingHelper.fillOrganizationDetails();
    await expect(page.locator('[data-testid="save-status-saved"]')).toBeVisible();
    
    // Set short timeout for testing
    await page.addInitScript(() => {
      window.INACTIVITY_TIMEOUT = 3000; // 3 seconds
    });
    
    // Wait 2 seconds
    await page.waitForTimeout(2000);
    
    // User activity - click somewhere
    await page.click('[data-testid="organization-name"]');
    
    // Wait another 2 seconds (total 4, but timer should have reset)
    await page.waitForTimeout(2000);
    
    // Should not show inactivity modal yet
    await expect(page.locator('[data-testid="inactivity-modal"]')).not.toBeVisible();
    
    // Wait for timeout after last activity
    await page.waitForTimeout(2000);
    
    // Now should show modal
    await expect(page.locator('[data-testid="inactivity-modal"]')).toBeVisible();
  });

  test('should resume from inactivity modal', async ({ page }) => {
    const email = `test-resume-inactivity-${Date.now()}@example.com`;
    await authHelper.signUp(email, 'password123', testOrganizationData.name);
    
    await onboardingHelper.fillOrganizationDetails();
    await expect(page.locator('[data-testid="save-status-saved"]')).toBeVisible();
    
    // Trigger inactivity
    await page.addInitScript(() => {
      window.INACTIVITY_TIMEOUT = 1000; // 1 second
    });
    await page.waitForTimeout(2000);
    
    await expect(page.locator('[data-testid="inactivity-modal"]')).toBeVisible();
    
    // Click resume
    await page.click('[data-testid="resume-button"]');
    
    // Modal should close and user can continue
    await expect(page.locator('[data-testid="inactivity-modal"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="organization-name"]')).toBeEnabled();
  });

  test('should not show inactivity modal when disabled', async ({ page }) => {
    const email = `test-disabled-inactivity-${Date.now()}@example.com`;
    await authHelper.signUp(email, 'password123', testOrganizationData.name);
    
    await onboardingHelper.fillOrganizationDetails();
    await onboardingHelper.clickNext(); // Move to next step
    
    // Add employee (active interaction)
    await onboardingHelper.addEmployeeManually();
    
    // Set very short timeout
    await page.addInitScript(() => {
      window.INACTIVITY_TIMEOUT = 1000;
    });
    
    await page.waitForTimeout(2000);
    
    // Should not show inactivity modal during active user flows
    await expect(page.locator('[data-testid="inactivity-modal"]')).not.toBeVisible();
  });

  test('should show different message based on draft status', async ({ page }) => {
    const email = `test-draft-message-${Date.now()}@example.com`;
    await authHelper.signUp(email, 'password123', testOrganizationData.name);
    
    // Set short timeout
    await page.addInitScript(() => {
      window.INACTIVITY_TIMEOUT = 1000;
    });
    
    // Case 1: No draft data
    await page.waitForTimeout(2000);
    await expect(page.locator('[data-testid="inactivity-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="inactivity-message"]')).toContainText('continue your onboarding');
    
    await page.click('[data-testid="resume-button"]');
    
    // Case 2: With draft data
    await onboardingHelper.fillOrganizationDetails();
    await expect(page.locator('[data-testid="save-status-saved"]')).toBeVisible();
    
    await page.waitForTimeout(2000);
    await expect(page.locator('[data-testid="inactivity-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="inactivity-message"]')).toContainText('draft has been saved');
  });

  test('should handle multiple inactivity periods', async ({ page }) => {
    const email = `test-multiple-inactivity-${Date.now()}@example.com`;
    await authHelper.signUp(email, 'password123', testOrganizationData.name);
    
    await page.addInitScript(() => {
      window.INACTIVITY_TIMEOUT = 1500;
    });
    
    // First inactivity period
    await page.waitForTimeout(2000);
    await expect(page.locator('[data-testid="inactivity-modal"]')).toBeVisible();
    await page.click('[data-testid="resume-button"]');
    
    // Some activity
    await onboardingHelper.fillOrganizationDetails();
    
    // Second inactivity period
    await page.waitForTimeout(2000);
    await expect(page.locator('[data-testid="inactivity-modal"]')).toBeVisible();
    await page.click('[data-testid="resume-button"]');
    
    // Should continue to work normally
    await expect(page.locator('[data-testid="organization-name"]')).toBeEnabled();
  });
});