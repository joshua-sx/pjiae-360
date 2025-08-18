import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helper';
import { OnboardingHelper } from './helpers/onboarding-helper';
import { testOrganizationData, csvContent } from './fixtures/test-data';

test.describe('Onboarding CSV Flow', () => {
  let authHelper: AuthHelper;
  let onboardingHelper: OnboardingHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    onboardingHelper = new OnboardingHelper(page);
  });

  test('should complete CSV upload onboarding flow', async ({ page }) => {
    await authHelper.signUp(
      `test-csv-${Date.now()}@example.com`, 
      'password123', 
      testOrganizationData.name
    );

    // Step 1: Organization Setup with CSV method
    await onboardingHelper.expectStepActive(1);
    await onboardingHelper.fillOrganizationDetails();
    await onboardingHelper.selectEntryMethod('csv');
    await onboardingHelper.clickNext();

    // Step 2: CSV Upload (manual entry step should be skipped)
    await onboardingHelper.expectStepActive(2);
    await onboardingHelper.expectStepCompleted(1);
    
    await onboardingHelper.uploadCSV(csvContent);
    
    // Wait for processing
    await expect(page.locator('[data-testid="csv-processing"]')).toBeVisible();
    await expect(page.locator('[data-testid="csv-success"]')).toBeVisible();
    
    // Should show imported employees
    await onboardingHelper.expectEmployeeInList('John Doe');
    await onboardingHelper.expectEmployeeInList('Jane Smith');
    await onboardingHelper.expectEmployeeInList('Bob Johnson');
    
    await onboardingHelper.clickNext();

    // Step 3: Appraisal Setup
    await onboardingHelper.expectStepActive(3);
    await onboardingHelper.expectStepCompleted(2);
    await onboardingHelper.completeAppraisalSetup();
    await onboardingHelper.clickNext();

    // Should complete and redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle CSV validation errors', async ({ page }) => {
    await authHelper.signUp(
      `test-csv-validation-${Date.now()}@example.com`, 
      'password123', 
      testOrganizationData.name
    );

    // Setup organization with CSV method
    await onboardingHelper.fillOrganizationDetails();
    await onboardingHelper.selectEntryMethod('csv');
    await onboardingHelper.clickNext();

    // Upload invalid CSV
    const invalidCsv = 'name,email\nJohn Doe,invalid-email\n,missing-name@email.com';
    await onboardingHelper.uploadCSV(invalidCsv);

    // Should show validation errors
    await expect(page.locator('[data-testid="csv-errors"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-invalid-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-missing-name"]')).toBeVisible();

    // Next button should be disabled
    await expect(page.locator('[data-testid="next-button"]')).toBeDisabled();
  });

  test('should allow CSV re-upload after errors', async ({ page }) => {
    await authHelper.signUp(
      `test-csv-reupload-${Date.now()}@example.com`, 
      'password123', 
      testOrganizationData.name
    );

    await onboardingHelper.fillOrganizationDetails();
    await onboardingHelper.selectEntryMethod('csv');
    await onboardingHelper.clickNext();

    // Upload invalid CSV first
    const invalidCsv = 'name,email\nJohn Doe,invalid-email';
    await onboardingHelper.uploadCSV(invalidCsv);
    
    await expect(page.locator('[data-testid="csv-errors"]')).toBeVisible();

    // Upload valid CSV
    await onboardingHelper.uploadCSV(csvContent);
    
    // Errors should be cleared and employees shown
    await expect(page.locator('[data-testid="csv-errors"]')).not.toBeVisible();
    await onboardingHelper.expectEmployeeInList('John Doe');
    
    // Next button should be enabled
    await expect(page.locator('[data-testid="next-button"]')).toBeEnabled();
  });

  test('should handle large CSV files', async ({ page }) => {
    await authHelper.signUp(
      `test-csv-large-${Date.now()}@example.com`, 
      'password123', 
      testOrganizationData.name
    );

    await onboardingHelper.fillOrganizationDetails();
    await onboardingHelper.selectEntryMethod('csv');
    await onboardingHelper.clickNext();

    // Generate large CSV (100 employees)
    let largeCsv = 'name,email,division,department\n';
    for (let i = 1; i <= 100; i++) {
      largeCsv += `Employee ${i},employee${i}@company.com,Division ${Math.ceil(i/20)},Department ${Math.ceil(i/10)}\n`;
    }

    await onboardingHelper.uploadCSV(largeCsv);

    // Should show processing state
    await expect(page.locator('[data-testid="csv-processing"]')).toBeVisible();
    
    // Should eventually complete
    await expect(page.locator('[data-testid="csv-success"]')).toBeVisible({ timeout: 10000 });
    
    // Should show employee count
    await expect(page.locator('[data-testid="employee-count"]')).toHaveText('100 employees imported');
  });

  test('should switch between entry methods', async ({ page }) => {
    await authHelper.signUp(
      `test-switch-method-${Date.now()}@example.com`, 
      'password123', 
      testOrganizationData.name
    );

    await onboardingHelper.fillOrganizationDetails();
    
    // Start with manual
    await onboardingHelper.selectEntryMethod('manual');
    await onboardingHelper.clickNext();
    
    // Go back and switch to CSV
    await onboardingHelper.clickBack();
    await onboardingHelper.selectEntryMethod('csv');
    await onboardingHelper.clickNext();

    // Should now be on CSV upload step
    await expect(page.locator('[data-testid="csv-upload"]')).toBeVisible();
    await expect(page.locator('[data-testid="manual-entry-form"]')).not.toBeVisible();
  });
});