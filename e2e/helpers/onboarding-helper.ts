import { Page, expect } from '@playwright/test';
import { testEmployeeData, testOrganizationData, testAppraisalCycle } from '../fixtures/test-data';

export class OnboardingHelper {
  constructor(private page: Page) {}

  async fillOrganizationDetails(data = testOrganizationData) {
    await this.page.fill('[data-testid="organization-name"]', data.name);
    await this.page.selectOption('[data-testid="industry-select"]', data.industry);
    await this.page.selectOption('[data-testid="size-select"]', data.size);
  }

  async selectEntryMethod(method: 'manual' | 'csv') {
    await this.page.click(`[data-testid="entry-method-${method}"]`);
  }

  async addEmployeeManually(employee = testEmployeeData[0]) {
    await this.page.click('[data-testid="add-employee-button"]');
    await this.page.fill('[data-testid="employee-name"]', employee.name);
    await this.page.fill('[data-testid="employee-email"]', employee.email);
    await this.page.fill('[data-testid="employee-division"]', employee.division);
    await this.page.fill('[data-testid="employee-department"]', employee.department);
    await this.page.click('[data-testid="save-employee"]');
  }

  async uploadCSV(csvContent: string) {
    const buffer = Buffer.from(csvContent);
    await this.page.setInputFiles('[data-testid="csv-upload"]', {
      name: 'employees.csv',
      mimeType: 'text/csv',
      buffer
    });
    await this.page.click('[data-testid="process-csv"]');
  }

  async navigateToStep(stepNumber: number) {
    await this.page.click(`[data-testid="step-${stepNumber}"]`);
  }

  async completeAppraisalSetup(cycle = testAppraisalCycle) {
    await this.page.fill('[data-testid="cycle-name"]', cycle.name);
    await this.page.fill('[data-testid="cycle-description"]', cycle.description);
    
    // Add goal window
    await this.page.click('[data-testid="add-goal-window"]');
    await this.page.fill('[data-testid="goal-window-name"]', cycle.goalWindows[0].name);
    
    // Add review period
    await this.page.click('[data-testid="add-review-period"]');
    await this.page.fill('[data-testid="review-period-name"]', cycle.reviewPeriods[0].name);
  }

  async expectStepActive(stepNumber: number) {
    await expect(this.page.locator(`[data-testid="step-${stepNumber}"][data-state="active"]`)).toBeVisible();
  }

  async expectStepCompleted(stepNumber: number) {
    await expect(this.page.locator(`[data-testid="step-${stepNumber}"][data-state="completed"]`)).toBeVisible();
  }

  async expectEmployeeInList(name: string) {
    await expect(this.page.locator(`[data-testid="employee-${name}"]`)).toBeVisible();
  }

  async clickNext() {
    await this.page.click('[data-testid="next-button"]');
  }

  async clickBack() {
    await this.page.click('[data-testid="back-button"]');
  }
}