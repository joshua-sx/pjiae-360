import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helper';
import { OnboardingHelper } from './helpers/onboarding-helper';
import { testEmployeeData, testOrganizationData } from './fixtures/test-data';

test.describe('Onboarding Manual Flow', () => {
  let authHelper: AuthHelper;
  let onboardingHelper: OnboardingHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    onboardingHelper = new OnboardingHelper(page);
  });

  test('should complete full manual onboarding flow', async ({ page }) => {
    // Start fresh registration
    await authHelper.signUp(
      `test-${Date.now()}@example.com`, 
      'password123', 
      testOrganizationData.name
    );

    // Step 1: Organization Setup
    await onboardingHelper.expectStepActive(1);
    await onboardingHelper.fillOrganizationDetails();
    await onboardingHelper.selectEntryMethod('manual');
    await onboardingHelper.clickNext();

    // Step 2: Manual Entry
    await onboardingHelper.expectStepActive(2);
    await onboardingHelper.expectStepCompleted(1);
    
    // Add multiple employees
    for (const employee of testEmployeeData) {
      await onboardingHelper.addEmployeeManually(employee);
      await onboardingHelper.expectEmployeeInList(employee.name);
    }
    
    await onboardingHelper.clickNext();

    // Step 3: Appraisal Setup
    await onboardingHelper.expectStepActive(3);
    await onboardingHelper.expectStepCompleted(2);
    await onboardingHelper.completeAppraisalSetup();
    await onboardingHelper.clickNext();

    // Should complete and redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="dashboard-welcome"]')).toBeVisible();
  });

  test('should allow navigation between completed steps', async ({ page }) => {
    await authHelper.signUp(
      `test-nav-${Date.now()}@example.com`, 
      'password123', 
      testOrganizationData.name
    );

    // Complete first step
    await onboardingHelper.fillOrganizationDetails();
    await onboardingHelper.selectEntryMethod('manual');
    await onboardingHelper.clickNext();

    // Should be able to go back to step 1
    await onboardingHelper.navigateToStep(1);
    await onboardingHelper.expectStepActive(1);

    // Should be able to navigate to step 2 (next step)
    await onboardingHelper.navigateToStep(2);
    await onboardingHelper.expectStepActive(2);

    // Should NOT be able to navigate to step 3 (not completed)
    await onboardingHelper.navigateToStep(3);
    await onboardingHelper.expectStepActive(2); // Should stay on step 2
  });

  test('should validate required fields', async ({ page }) => {
    await authHelper.signUp(
      `test-validation-${Date.now()}@example.com`, 
      'password123', 
      testOrganizationData.name
    );

    // Try to proceed without filling required fields
    await onboardingHelper.clickNext();

    // Should show validation errors
    await expect(page.locator('[data-testid="organization-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="industry-error"]')).toBeVisible();
    
    // Should stay on current step
    await onboardingHelper.expectStepActive(1);
  });

  test('should handle employee form validation', async ({ page }) => {
    await authHelper.signUp(
      `test-emp-validation-${Date.now()}@example.com`, 
      'password123', 
      testOrganizationData.name
    );

    // Complete organization setup
    await onboardingHelper.fillOrganizationDetails();
    await onboardingHelper.selectEntryMethod('manual');
    await onboardingHelper.clickNext();

    // Try to add employee without required fields
    await page.click('[data-testid="add-employee-button"]');
    await page.click('[data-testid="save-employee"]');

    // Should show validation errors
    await expect(page.locator('[data-testid="employee-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="employee-email-error"]')).toBeVisible();

    // Employee should not be added
    await expect(page.locator('[data-testid="employee-list"] tr')).toHaveCount(1); // Header only
  });

  test('should allow editing and deleting employees', async ({ page }) => {
    await authHelper.signUp(
      `test-edit-${Date.now()}@example.com`, 
      'password123', 
      testOrganizationData.name
    );

    // Complete organization setup
    await onboardingHelper.fillOrganizationDetails();
    await onboardingHelper.selectEntryMethod('manual');
    await onboardingHelper.clickNext();

    // Add an employee
    await onboardingHelper.addEmployeeManually(testEmployeeData[0]);

    // Edit employee
    await page.click(`[data-testid="edit-employee-${testEmployeeData[0].name}"]`);
    await page.fill('[data-testid="employee-name"]', 'Updated Name');
    await page.click('[data-testid="save-employee"]');

    // Should show updated name
    await onboardingHelper.expectEmployeeInList('Updated Name');

    // Delete employee
    await page.click(`[data-testid="delete-employee-Updated Name"]`);
    await page.click('[data-testid="confirm-delete"]');

    // Employee should be removed
    await expect(page.locator('[data-testid="employee-Updated Name"]')).not.toBeVisible();
  });
});