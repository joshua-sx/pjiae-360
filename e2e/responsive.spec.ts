import { test, expect } from '@playwright/test';

test.describe('Responsive Layout Tests', () => {
  // Test mobile viewport (768px and below)
  test('mobile layout shows bottom navigation and stacks content correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    await page.goto('/');

    // Check if bottom navigation is visible on mobile
    const bottomNav = page.locator('[data-testid="mobile-bottom-nav"]');
    await expect(bottomNav).toBeVisible();

    // Check if sidebar is hidden on mobile
    const sidebar = page.locator('[data-testid="app-sidebar"]');
    await expect(sidebar).not.toBeVisible();
  });

  // Test tablet viewport (768px - 1024px)
  test('tablet layout shows responsive grid with 2 columns', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // Tablet size
    await page.goto('/admin/employees');

    // Check if grid adapts to tablet size
    const grid = page.locator('.grid');
    await expect(grid).toHaveClass(/grid-cols-2/);
  });

  // Test desktop viewport (1024px and above)
  test('desktop layout shows sidebar and hides bottom navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 }); // Desktop size
    await page.goto('/');

    // Check if sidebar is visible on desktop
    const sidebar = page.locator('[data-testid="app-sidebar"]');
    await expect(sidebar).toBeVisible();

    // Check if bottom navigation is hidden on desktop
    const bottomNav = page.locator('[data-testid="mobile-bottom-nav"]');
    await expect(bottomNav).not.toBeVisible();
  });

  // Test employees page responsive behavior
  test('employees page adapts layout based on screen size', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin/employees');

    // Should show mobile cards instead of table
    const mobileCards = page.locator('[data-testid="mobile-employee-card"]');
    const desktopTable = page.locator('[data-testid="employee-table"]');
    
    await expect(mobileCards).toBeVisible();
    await expect(desktopTable).not.toBeVisible();

    // Test desktop view
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();

    // Should show desktop table instead of mobile cards
    await expect(mobileCards).not.toBeVisible();
    await expect(desktopTable).toBeVisible();
  });

  // Test date picker responsive behavior
  test('date picker shows appropriate number of months based on screen size', async ({ page }) => {
    // Test mobile view - should show 1 month
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin/employees');

    // Find and click date picker trigger
    const datePickerTrigger = page.locator('[data-testid="date-range-picker-trigger"]');
    await datePickerTrigger.click();

    // Check if only one month is visible
    const calendarMonths = page.locator('.rdp-month');
    await expect(calendarMonths).toHaveCount(1);

    // Close the popover
    await page.keyboard.press('Escape');

    // Test desktop view - should show 2 months
    await page.setViewportSize({ width: 1440, height: 900 });
    await datePickerTrigger.click();

    // Check if two months are visible
    await expect(calendarMonths).toHaveCount(2);
  });

  // Test container padding and spacing
  test('containers use appropriate padding for different screen sizes', async ({ page }) => {
    // Test mobile padding
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin/employees');

    const container = page.locator('.page-container, .container-wide').first();
    const paddingClass = await container.getAttribute('class');
    expect(paddingClass).toContain('px-4');

    // Test desktop padding
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();

    const desktopPaddingClass = await container.getAttribute('class');
    expect(desktopPaddingClass).toMatch(/px-6|px-8/);
  });

  // Test responsive grid component
  test('responsive grid adjusts columns based on screen size', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Find responsive grid elements
    const grids = page.locator('.grid');
    for (const grid of await grids.all()) {
      const gridClass = await grid.getAttribute('class');
      // On mobile, should use single column
      expect(gridClass).toContain('grid-cols-1');
    }

    // Test desktop grid
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();

    // Should use multi-column layout on desktop
    for (const grid of await grids.all()) {
      const gridClass = await grid.getAttribute('class');
      expect(gridClass).toMatch(/grid-cols-[2-4]/);
    }
  });
});