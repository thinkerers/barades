import { test as base, Page } from '@playwright/test';
import {
  createPollForGroup as createPollForGroupHelper,
  createPollSandbox as createPollSandboxHelper,
  createSessionSandbox as createSessionSandboxHelper,
  type CreatedPollContext,
  type PollCreationOptions,
  type PollSandboxContext,
  type PollSandboxOptions,
  type SessionSandboxContext,
  type SessionSandboxOptions,
} from '../helpers/test-data';

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

export type User =
  | 'alice_dm'
  | 'bob_boardgamer'
  | 'carol_newbie'
  | 'dave_poker'
  | 'eve_admin';

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
  createPollSandbox: (
    options?: PollSandboxOptions
  ) => Promise<PollSandboxContext>;

  /**
   * Helper to attach polls to an existing sandbox group
   */
  createPollForGroup: (
    groupId: string,
    options?: PollCreationOptions
  ) => Promise<CreatedPollContext>;

  /**
   * Helper to create isolated Playwright sessions backed by Prisma
   */
  createSessionSandbox: (
    options?: SessionSandboxOptions
  ) => Promise<SessionSandboxContext>;
}

/**
 * Login helper function
 * Uses API directly to get token and set it in localStorage for faster/more reliable auth
 */
async function loginUser(
  page: Page,
  username: User,
  password = 'password123'
): Promise<void> {
  // Login via API to get token
  const apiUrl =
    process.env['BASE_URL']?.replace(':4200', ':3000') ||
    'http://localhost:3000';
  const response = await page.request.post(`${apiUrl}/api/auth/login`, {
    data: { username, password },
  });

  if (!response.ok()) {
    throw new Error(
      `Login failed for ${username}: ${response.status()} ${await response.text()}`
    );
  }

  const { accessToken } = await response.json();

  // Set token in localStorage before navigating
  await page.goto('/');
  await page.evaluate((token) => {
    localStorage.setItem('accessToken', token);
  }, accessToken);

  // Reload to apply auth state
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
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

  // eslint-disable-next-line no-empty-pattern
  createPollForGroup: async ({}, use) => {
    await use(async (groupId: string, options?: PollCreationOptions) => {
      return createPollForGroupHelper(groupId, options);
    });
  },

  // eslint-disable-next-line no-empty-pattern
  createSessionSandbox: async ({}, use) => {
    const active: Array<SessionSandboxContext & { cleaned?: boolean }> = [];

    await use(async (options) => {
      const sandbox = await createSessionSandboxHelper(options);
      const wrapped: SessionSandboxContext & { cleaned?: boolean } = {
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
