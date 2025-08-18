import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helper';
import { OnboardingHelper } from './helpers/onboarding-helper';
import { testEmployeeData, testOrganizationData, csvContent } from './fixtures/test-data';

test.describe('Onboarding Happy Path', () => {
  let authHelper: AuthHelper;
  let onboardingHelper: OnboardingHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    onboardingHelper = new OnboardingHelper(page);
  });

  test('should complete entire onboarding journey successfully', async ({ page }) => {
    const email = `test-complete-${Date.now()}@example.com`;
    
    // Registration and initial setup
    await authHelper.signUp(email, 'password123', testOrganizationData.name);
    
    // Verify onboarding starts
    await expect(page).toHaveURL('/onboarding');
    await expect(page.locator('[data-testid="onboarding-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="milestone-progress"]')).toBeVisible();
    
    // Step 1: Organization Setup
    await onboardingHelper.expectStepActive(1);
    await expect(page.locator('[data-testid="step-title"]')).toContainText('Organization Setup');
    
    await onboardingHelper.fillOrganizationDetails(testOrganizationData);
    await onboardingHelper.selectEntryMethod('csv'); // Use CSV for efficiency
    
    // Verify auto-save
    await expect(page.locator('[data-testid="save-status-saved"]')).toBeVisible();
    
    await onboardingHelper.clickNext();
    
    // Step 2: Data Import (CSV method skips manual entry)
    await onboardingHelper.expectStepActive(2);
    await onboardingHelper.expectStepCompleted(1);
    await expect(page.locator('[data-testid="step-title"]')).toContainText('Data Import');
    
    await onboardingHelper.uploadCSV(csvContent);
    await expect(page.locator('[data-testid="csv-success"]')).toBeVisible();
    
    // Verify imported employees are displayed
    await onboardingHelper.expectEmployeeInList('John Doe');
    await onboardingHelper.expectEmployeeInList('Jane Smith');
    await onboardingHelper.expectEmployeeInList('Bob Johnson');
    
    // Verify org structure extraction
    await expect(page.locator('[data-testid="org-structure-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="division-Engineering"]')).toBeVisible();
    await expect(page.locator('[data-testid="division-Sales"]')).toBeVisible();
    
    await onboardingHelper.clickNext();
    
    // Step 3: Appraisal Setup
    await onboardingHelper.expectStepActive(3);
    await onboardingHelper.expectStepCompleted(2);
    await expect(page.locator('[data-testid="step-title"]')).toContainText('Appraisal Cycle Setup');
    
    await onboardingHelper.completeAppraisalSetup();
    
    // Verify setup summary
    await expect(page.locator('[data-testid="cycle-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="goal-windows-count"]')).toContainText('1');
    await expect(page.locator('[data-testid="review-periods-count"]')).toContainText('1');
    
    await onboardingHelper.clickNext();
    
    // Completion and redirect
    await expect(page.locator('[data-testid="completion-message"]')).toBeVisible();
    await expect(page).toHaveURL('/dashboard');
    
    // Verify dashboard shows onboarding completion
    await expect(page.locator('[data-testid="dashboard-welcome"]')).toBeVisible();
    await expect(page.locator('[data-testid="employee-count"]')).toContainText('3');
    await expect(page.locator('[data-testid="active-cycle"]')).toBeVisible();
  });

  test('should maintain data consistency throughout journey', async ({ page }) => {
    const email = `test-consistency-${Date.now()}@example.com`;
    
    await authHelper.signUp(email, 'password123', testOrganizationData.name);
    
    // Step 1: Fill organization data
    await onboardingHelper.fillOrganizationDetails(testOrganizationData);
    await onboardingHelper.selectEntryMethod('manual');
    await onboardingHelper.clickNext();
    
    // Step 2: Add employees manually
    for (const employee of testEmployeeData) {
      await onboardingHelper.addEmployeeManually(employee);
    }
    
    // Navigate back to step 1 and verify data persistence
    await onboardingHelper.navigateToStep(1);
    await expect(page.locator('[data-testid="organization-name"]')).toHaveValue(testOrganizationData.name);
    await expect(page.locator('[data-testid="industry-select"]')).toHaveValue(testOrganizationData.industry);
    await expect(page.locator('[data-testid="entry-method-manual"]')).toBeChecked();
    
    // Navigate back to step 2 and verify employees
    await onboardingHelper.navigateToStep(2);
    for (const employee of testEmployeeData) {
      await onboardingHelper.expectEmployeeInList(employee.name);
    }
    
    // Continue to completion
    await onboardingHelper.clickNext();
    await onboardingHelper.completeAppraisalSetup();
    await onboardingHelper.clickNext();
    
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle all validation and error scenarios gracefully', async ({ page }) => {
    const email = `test-validation-flow-${Date.now()}@example.com`;
    
    await authHelper.signUp(email, 'password123', testOrganizationData.name);
    
    // Test step 1 validation
    await onboardingHelper.clickNext();
    await expect(page.locator('[data-testid="validation-errors"]')).toBeVisible();
    await onboardingHelper.expectStepActive(1); // Should stay on step 1
    
    // Fix validation errors
    await onboardingHelper.fillOrganizationDetails();
    await onboardingHelper.selectEntryMethod('csv');
    await onboardingHelper.clickNext();
    
    // Test step 2 validation (no CSV uploaded)
    await onboardingHelper.clickNext();
    await expect(page.locator('[data-testid="csv-required-error"]')).toBeVisible();
    await onboardingHelper.expectStepActive(2); // Should stay on step 2
    
    // Fix by uploading CSV
    await onboardingHelper.uploadCSV(csvContent);
    await onboardingHelper.clickNext();
    
    // Test step 3 validation
    await onboardingHelper.clickNext();
    await expect(page.locator('[data-testid="appraisal-validation-errors"]')).toBeVisible();
    await onboardingHelper.expectStepActive(3); // Should stay on step 3
    
    // Complete properly
    await onboardingHelper.completeAppraisalSetup();
    await onboardingHelper.clickNext();
    
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show progress indicators correctly', async ({ page }) => {
    const email = `test-progress-${Date.now()}@example.com`;
    
    await authHelper.signUp(email, 'password123', testOrganizationData.name);
    
    // Initially, only step 1 should be active
    await onboardingHelper.expectStepActive(1);
    await expect(page.locator('[data-testid="progress-bar"]')).toHaveAttribute('aria-valuenow', '25'); // 1/4 steps for CSV
    
    // Complete step 1
    await onboardingHelper.fillOrganizationDetails();
    await onboardingHelper.selectEntryMethod('csv');
    await onboardingHelper.clickNext();
    
    // Step 1 completed, step 2 active
    await onboardingHelper.expectStepCompleted(1);
    await onboardingHelper.expectStepActive(2);
    await expect(page.locator('[data-testid="progress-bar"]')).toHaveAttribute('aria-valuenow', '50'); // 2/4 steps for CSV
    
    // Complete step 2
    await onboardingHelper.uploadCSV(csvContent);
    await onboardingHelper.clickNext();
    
    // Step 2 completed, step 3 active
    await onboardingHelper.expectStepCompleted(2);
    await onboardingHelper.expectStepActive(3);
    await expect(page.locator('[data-testid="progress-bar"]')).toHaveAttribute('aria-valuenow', '75'); // 3/4 steps
    
    // Complete final step
    await onboardingHelper.completeAppraisalSetup();
    await onboardingHelper.clickNext();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle switching entry methods mid-flow', async ({ page }) => {
    const email = `test-switch-methods-${Date.now()}@example.com`;
    
    await authHelper.signUp(email, 'password123', testOrganizationData.name);
    
    // Start with manual method
    await onboardingHelper.fillOrganizationDetails();
    await onboardingHelper.selectEntryMethod('manual');
    await onboardingHelper.clickNext();
    
    // Add some employees manually
    await onboardingHelper.addEmployeeManually(testEmployeeData[0]);
    
    // Go back and switch to CSV
    await onboardingHelper.clickBack();
    await onboardingHelper.selectEntryMethod('csv');
    await onboardingHelper.clickNext();
    
    // Should now show CSV upload interface
    await expect(page.locator('[data-testid="csv-upload"]')).toBeVisible();
    
    // Upload CSV (should replace manual entries)
    await onboardingHelper.uploadCSV(csvContent);
    
    // Should show CSV employees, not manual ones
    await onboardingHelper.expectEmployeeInList('John Doe'); // From CSV
    await expect(page.locator(`[data-testid="employee-${testEmployeeData[0].name}"]`)).not.toBeVisible();
    
    // Complete onboarding
    await onboardingHelper.clickNext();
    await onboardingHelper.completeAppraisalSetup();
    await onboardingHelper.clickNext();
    
    await expect(page).toHaveURL('/dashboard');
  });
});