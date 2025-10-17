import { test as base, Page } from '@playwright/test';
import { createPollSandbox as createPollSandboxHelper, type PollSandboxContext, type PollSandboxOptions } from '../helpers/test-data';

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
   * Helper to create isolated poll sandbox groups backed by Prisma
   */
  createPollSandbox: (options?: PollSandboxOptions) => Promise<PollSandboxContext>;
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
  createPollSandbox: async ({}, use) => {
    const active: Array<PollSandboxContext & { cleaned?: boolean }> = [];

    await use(async (options) => {
      const sandbox = await createPollSandboxHelper(options);
      const wrapped: PollSandboxContext & { cleaned?: boolean } = {
        ...sandbox,
        async cleanup() {
          if (wrapped.cleaned) {
            return;
          }
          wrapped.cleaned = true;
          await sandbox.cleanup();
        },
      };

      active.push(wrapped);
      return wrapped;
    });

    while (active.length > 0) {
      const sandbox = active.pop();
      if (!sandbox) continue;
      await sandbox.cleanup();
    }
  },
});

export { expect } from '@playwright/test';
