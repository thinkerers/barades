import type { Page, TestInfo } from '@playwright/test';
import { expect, test } from './fixtures/auth.fixture';
import type {
  PollSandboxContext,
  PollSandboxOptions,
} from './helpers/test-data';

async function openSandboxGroup(
  page: Page,
  createPollSandbox: (
    options?: PollSandboxOptions
  ) => Promise<PollSandboxContext>,
  testInfo: TestInfo,
  options?: PollSandboxOptions
): Promise<PollSandboxContext> {
  const sandbox = await createPollSandbox({
    namePrefix: `Error Handling Sandbox ${testInfo.title}`,
    members: ['alice_dm'],
    ...options,
  });

  await page.goto('/groups');
  const groupCard = page.locator('.group-card', { hasText: sandbox.groupName });
  await expect(groupCard).toBeVisible();
  await groupCard.getByRole('button', { name: 'Voir les détails' }).click();
  await expect(page.locator('.group-detail__title')).toContainText(
    sandbox.groupName
  );
  return sandbox;
}

/**
 * Error Handling and Network Failures Tests
 *
 * Tests how the application handles:
 * - Network failures (offline, timeout)
 * - API errors (500, 404, 503)
 * - Slow networks
 *
 * Best practices 2025:
 * - Use page.route() for request interception
 * - Test user-facing error messages, not technical details
 * - Verify graceful degradation
 * - Check retry mechanisms
 */
test.describe('Error Handling', () => {
  test.describe('Network Failures', () => {
    test('should show error message when API is unreachable', async ({
      authenticatedPage: page,
    }) => {
      // Intercept all API requests and abort them (simulate network failure)
      await page.route('**/api/**', (route) => route.abort());

      // Try to navigate to groups (requires API call)
      await page.goto('/groups');

      // Should show user-friendly error message
      // Note: Adjust selector based on actual error component
      await expect(page.getByText(/erreur|error|impossible/i)).toBeVisible({
        timeout: 10000,
      });
    });

    test('should handle groups API timeout gracefully', async ({
      authenticatedPage: page,
    }) => {
      test.fixme(
        true,
        'UI does not yet surface a timeout message for stalled group loads.'
      );
      // Simulate slow API (timeout after 30s)
      await page.route('**/api/groups', () => {
        // Never resolve - causes timeout (simulates hung connection)
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return new Promise(() => {});
      });

      await page.goto('/groups');

      // Should show loading state then timeout message
      await expect(
        page
          .getByText(/chargement|loading/i)
          .or(page.locator('.spinner, .loading'))
      ).toBeVisible({ timeout: 5000 });

      // After timeout, should show error
      await expect(page.getByText(/erreur|timeout|délai dépassé/i)).toBeVisible(
        { timeout: 35000 }
      );
    });

    test('should allow retry after network error', async ({
      authenticatedPage: page,
    }) => {
      test.fixme(true, 'Retry UX not implemented yet after network failure.');
      let callCount = 0;

      // First call fails, second succeeds (simulates retry)
      await page.route('**/api/groups', (route) => {
        callCount++;
        if (callCount === 1) {
          route.abort();
        } else {
          route.continue();
        }
      });

      await page.goto('/groups');

      // Should show error first
      await expect(page.getByText(/erreur|error/i)).toBeVisible({
        timeout: 10000,
      });

      // NOTE: This test validates retry mechanism exists
      // In future, add retry button and uncomment below:
      // await page.getByRole('button', { name: /réessayer|retry/i }).click();
      // await expect(page.locator('.group-card').first()).toBeVisible();
    });
  });

  test.describe('API Errors', () => {
    test('should handle 500 Internal Server Error', async ({
      authenticatedPage: page,
    }) => {
      test.fixme(
        true,
        'Application does not yet display a friendly message for server errors.'
      );
      // Mock 500 error for groups endpoint
      await page.route('**/api/groups', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            statusCode: 500,
            message: 'Internal server error',
            error: 'Internal Server Error',
          }),
        });
      });

      await page.goto('/groups');

      // Should show user-friendly error (not technical stack trace)
      await expect(
        page.getByText(/erreur serveur|server error|problème technique/i)
      ).toBeVisible({ timeout: 10000 });

      // Should NOT show technical details to user
      await expect(
        page.getByText(/stack trace|line \d+|internal/i)
      ).toBeHidden();
    });

    test('should handle 404 Not Found for missing group', async ({
      authenticatedPage: page,
    }) => {
      test.fixme(true, 'Missing group screen not implemented yet.');
      // Mock 404 for specific group
      await page.route('**/api/groups/nonexistent-id', (route) => {
        route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            statusCode: 404,
            message: 'Group not found',
            error: 'Not Found',
          }),
        });
      });

      await page.goto('/groups/nonexistent-id');

      // Should show "not found" message
      await expect(
        page.getByText(/groupe.*introuvable|not found|n'existe pas/i)
      ).toBeVisible({ timeout: 10000 });
    });

    test('should handle 503 Service Unavailable', async ({
      authenticatedPage: page,
    }) => {
      test.fixme(true, 'Maintenance mode banner not yet available.');
      // Mock 503 (maintenance mode)
      await page.route('**/api/**', (route) => {
        route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({
            statusCode: 503,
            message: 'Service temporarily unavailable',
            error: 'Service Unavailable',
          }),
        });
      });

      await page.goto('/groups');

      // Should show maintenance message
      await expect(
        page.getByText(/maintenance|indisponible|unavailable/i)
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Slow Network', () => {
    test('should show loading state during slow API calls', async ({
      authenticatedPage: page,
    }) => {
      test.fixme(
        true,
        'Groups page lacks loading indicator during slow responses.'
      );
      // Simulate slow API (3 second delay)
      await page.route('**/api/groups', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await route.continue();
      });

      await page.goto('/groups');

      // Should show loading indicator during delay
      await expect(
        page
          .getByText(/chargement|loading/i)
          .or(page.locator('.spinner, .loading, [data-testid="loading"]'))
      ).toBeVisible();

      // After delay, content should appear
      await expect(page.locator('.group-card').first()).toBeVisible({
        timeout: 10000,
      });
    });

    test('should not break UI with slow poll creation', async ({
      authenticatedPage: page,
      createPollSandbox,
    }, testInfo) => {
      test.fixme(
        true,
        'Poll creation flow missing optimistic/disabled state for slow responses.'
      );
      // Slow down poll creation endpoint
      await page.route('**/api/polls', async (route) => {
        if (route.request().method() === 'POST') {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        await route.continue();
      });

      await openSandboxGroup(page, createPollSandbox, testInfo);

      await page.getByTestId('create-poll-button').click();
      const pollTitle = `Test Slow Poll ${testInfo.repeatEachIndex}`;
      await page.getByTestId('poll-title-input').fill(pollTitle);
      await page.locator('#date-input').fill('2025-10-30T19:00');
      await page.getByRole('button', { name: /ajouter/i }).click();
      await page.locator('#date-input').fill('2025-11-02T19:00');
      await page.getByRole('button', { name: /ajouter/i }).click();

      // Click submit
      const submitButton = page.getByRole('button', {
        name: /créer le sondage/i,
      });
      await submitButton.click();

      // Should show loading state on button
      await expect(submitButton).toBeDisabled();

      // After delay, poll should be created
      await expect(page.getByText(pollTitle)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Partial Failures', () => {
    test('should handle mixed success/failure when loading groups', async ({
      authenticatedPage: page,
    }) => {
      let requestCount = 0;

      // First groups request succeeds, but subsequent poll requests fail
      await page.route('**/api/groups/**', (route) => {
        requestCount++;
        if (requestCount > 1 && route.request().url().includes('/polls')) {
          // Polls fail
          route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'Failed to load polls' }),
          });
        } else {
          // Groups succeed
          route.continue();
        }
      });

      await page.goto('/groups');

      // Groups should load
      await expect(page.locator('.group-card').first()).toBeVisible({
        timeout: 10000,
      });

      // But polls might show error (if they're loaded per-group)
      // This tests graceful degradation - groups work even if polls fail
    });
  });

  test.describe('Offline Mode', () => {
    test('should detect and notify when going offline', async ({
      authenticatedPage: page,
    }) => {
      test.fixme(true, 'Offline notification banner not implemented.');
      await page.goto('/groups');

      // Wait for initial load
      await expect(page.locator('.group-card').first()).toBeVisible();

      // Simulate going offline
      await page.context().setOffline(true);

      // Try to navigate (should fail)
      await page
        .getByRole('button', { name: 'Voir les détails' })
        .first()
        .click();

      // Should show offline message
      await expect(page.getByText(/hors ligne|offline|connexion/i)).toBeVisible(
        { timeout: 10000 }
      );

      // Go back online
      await page.context().setOffline(false);
    });
  });
});
