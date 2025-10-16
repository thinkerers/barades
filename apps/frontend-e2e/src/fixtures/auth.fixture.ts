import { test as base, Page } from '@playwright/test';

/**
 * Authentication fixture for Playwright tests
 * 
 * Usage:
 * ```typescript
 * import { test, expect } from './fixtures/auth.fixture';
 * 
 * test('my test', async ({ authenticatedPage }) => {
 *   // Already logged in as alice_dm
 *   await authenticatedPage.goto('/groups');
 *   // ...
 * });
 * 
 * test('custom user', async ({ page, loginAs }) => {
 *   await loginAs(page, 'bob_boardgamer');
 *   // ...
 * });
 * ```
 */

export type User = 'alice_dm' | 'bob_boardgamer' | 'carol_newbie' | 'dave_poker' | 'eve_admin';

export interface AuthFixtures {
  /**
   * Page already authenticated as alice_dm
   */
  authenticatedPage: Page;
  
  /**
   * Function to login as a specific user
   */
  loginAs: (page: Page, username: User, password?: string) => Promise<void>;
  
  /**
   * Function to logout
   */
  logout: (page: Page) => Promise<void>;
}

/**
 * Login helper function
 */
async function loginUser(page: Page, username: User, password = 'password123'): Promise<void> {
  await page.goto('/login');
  await page.getByPlaceholder('alice_dm').fill(username);
  await page.getByPlaceholder('••••••••••••').fill(password);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.waitForURL('/');
}

/**
 * Logout helper function
 */
async function logoutUser(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.clear());
}

/**
 * Extended test with authentication fixtures
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Setup: login before test
    await loginUser(page, 'alice_dm');
    
    // Run test
    await use(page);
    
    // Teardown: logout after test
    await logoutUser(page);
  },
  
  loginAs: async (_context, use) => {
    await use(loginUser);
  },
  
  logout: async (_context, use) => {
    await use(logoutUser);
  },
});

export { expect } from '@playwright/test';
