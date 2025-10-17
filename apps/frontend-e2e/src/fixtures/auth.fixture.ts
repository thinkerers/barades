import { test as base, Page } from '@playwright/test';
import { acquireEliteStrategyPlayersLock } from '../helpers/api-cleanup';

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

  /**
   * Exclusive lock for Elite Strategy Players poll operations
   */
  eliteGroupLock: void;
}

/**
 * Login helper function
 */
async function loginUser(page: Page, username: User, password = 'password123'): Promise<void> {
  await page.goto('/login');
  // Use data-testid for stable selectors
  await page.getByTestId('username-input').fill(username);
  await page.getByTestId('password-input').fill(password);
  await page.getByTestId('login-submit-button').click();
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
  
  // Helper functions don't need context
  // eslint-disable-next-line no-empty-pattern
  loginAs: async ({}, use) => {
    await use(loginUser);
  },
  
  // eslint-disable-next-line no-empty-pattern
  logout: async ({}, use) => {
    await use(logoutUser);
  },

  // eslint-disable-next-line no-empty-pattern
  eliteGroupLock: async ({}, use) => {
    const release = await acquireEliteStrategyPlayersLock();
    try {
      await use(undefined);
    } finally {
      await release();
    }
  },
});

export { expect } from '@playwright/test';
