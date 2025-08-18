import { Page } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  async login(email: string = 'test@example.com', password: string = 'password123') {
    await this.page.goto('/login');
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
    await this.page.waitForURL('/dashboard');
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="logout-button"]');
    await this.page.waitForURL('/login');
  }

  async signUp(email: string, password: string, organizationName: string) {
    await this.page.goto('/signup');
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.fill('[data-testid="organization-name-input"]', organizationName);
    await this.page.click('[data-testid="signup-button"]');
    await this.page.waitForURL('/onboarding');
  }
}