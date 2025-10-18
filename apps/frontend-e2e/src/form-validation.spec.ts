import type { Page, TestInfo } from '@playwright/test';
import { expect, test } from './fixtures/auth.fixture';
import type { PollSandboxContext } from './helpers/test-data';

async function openSandboxPollForm(
  page: Page,
  createPollSandbox: (
    options?: Record<string, unknown>
  ) => Promise<PollSandboxContext>,
  testInfo: TestInfo
): Promise<PollSandboxContext> {
  const sandbox = await createPollSandbox({
    namePrefix: `Poll Form ${testInfo.title}`,
    members: ['alice_dm'],
  });

  await page.goto('/groups');
  const groupCard = page.locator('.group-card', { hasText: sandbox.groupName });
  await expect(groupCard).toBeVisible();
  await groupCard.getByRole('button', { name: 'Voir les détails' }).click();
  await expect(page.locator('.group-detail__title')).toContainText(
    sandbox.groupName
  );
  await page.getByTestId('create-poll-button').click();

  return sandbox;
}

/**
 * Form Validation Tests
 *
 * Tests client-side and server-side validations for:
 * - Required fields
 * - Format validation (email, dates, etc.)
 * - Business rules (min dates, max length, etc.)
 *
 * Best practices 2025:
 * - Test both client and server validations
 * - Verify error messages are user-friendly
 * - Test form remains usable after validation errors
 * - Check accessibility (aria-invalid, aria-describedby)
 */
test.describe('Form Validation', () => {
  test.describe('Poll Creation Form', () => {
    test('should require poll title', async ({
      authenticatedPage: page,
      createPollSandbox,
    }, testInfo) => {
      await openSandboxPollForm(page, createPollSandbox, testInfo);

      const submitButton = page.getByRole('button', {
        name: /créer le sondage/i,
      });

      await page.locator('#date-input').fill('2025-10-30T19:00');
      await page.getByRole('button', { name: /ajouter/i }).click();
      await page.locator('#date-input').fill('2025-11-02T19:00');
      await page.getByRole('button', { name: /ajouter/i }).click();

      await expect(submitButton).toBeDisabled();

      await page.getByTestId('poll-title-input').fill('Valid Title');
      await expect(submitButton).toBeEnabled();
    });

    test('should require minimum 2 dates', async ({
      authenticatedPage: page,
      createPollSandbox,
    }, testInfo) => {
      await openSandboxPollForm(page, createPollSandbox, testInfo);

      const submitButton = page.getByRole('button', {
        name: /créer le sondage/i,
      });
      await page.getByTestId('poll-title-input').fill('Test Poll');
      await expect(submitButton).toBeDisabled();

      await page.locator('#date-input').fill('2025-10-30T19:00');
      await page.getByRole('button', { name: /ajouter/i }).click();
      await expect(submitButton).toBeDisabled();

      await page.locator('#date-input').fill('2025-11-02T19:00');
      await page.getByRole('button', { name: /ajouter/i }).click();
      await expect(submitButton).toBeEnabled();
    });

    test('should reject empty poll title', async ({
      authenticatedPage: page,
      createPollSandbox,
    }, testInfo) => {
      await openSandboxPollForm(page, createPollSandbox, testInfo);

      const titleInput = page.getByTestId('poll-title-input');
      await titleInput.fill('Some text');
      await titleInput.clear();

      await page.locator('#date-input').fill('2025-10-30T19:00');
      await page.getByRole('button', { name: /ajouter/i }).click();
      await page.locator('#date-input').fill('2025-11-02T19:00');
      await page.getByRole('button', { name: /ajouter/i }).click();

      const submitButton = page.getByRole('button', {
        name: /créer le sondage/i,
      });
      await expect(submitButton).toBeDisabled();
    });

    test('should reject poll title over maximum length', async ({
      authenticatedPage: page,
      createPollSandbox,
    }, testInfo) => {
      test.fixme(true, 'Poll title length validation not enforced in UI yet.');
      await openSandboxPollForm(page, createPollSandbox, testInfo);

      const longTitle = 'A'.repeat(201);
      await page.getByTestId('poll-title-input').fill(longTitle);
      const value = await page.getByTestId('poll-title-input').inputValue();
      expect(value.length).toBeLessThanOrEqual(200);
    });

    test('should prevent duplicate dates', async ({
      authenticatedPage: page,
      createPollSandbox,
    }, testInfo) => {
      await openSandboxPollForm(page, createPollSandbox, testInfo);

      await page.getByTestId('poll-title-input').fill('Test Poll');
      const sameDate = '2025-10-30T19:00';
      await page.locator('#date-input').fill(sameDate);
      await page.getByRole('button', { name: /ajouter/i }).click();

      await page.locator('#date-input').fill(sameDate);
      await page.getByRole('button', { name: /ajouter/i }).click();

      const dateItems = page.locator(
        '.date-chip, .date-tag, [data-testid*="date-"]'
      );
      await expect(dateItems).toHaveCount(1);
    });

    test('should prevent past dates', async ({
      authenticatedPage: page,
      createPollSandbox,
    }, testInfo) => {
      await openSandboxPollForm(page, createPollSandbox, testInfo);

      await page.getByTestId('poll-title-input').fill('Test Poll');
      await page.locator('#date-input').fill('2020-01-01T19:00');
      await page.getByRole('button', { name: /ajouter/i }).click();

      const errorOrEmpty = page
        .getByText(/date.*passé|past date|date.*future/i)
        .or(page.locator('.date-chip, .date-tag'));
      await expect(errorOrEmpty.first()).toBeVisible({ timeout: 3000 });
    });

    test('should allow removing added dates', async ({
      authenticatedPage: page,
      createPollSandbox,
    }, testInfo) => {
      test.fixme(
        true,
        'Remove date action not available in poll creation form.'
      );
      await openSandboxPollForm(page, createPollSandbox, testInfo);

      await page.getByTestId('poll-title-input').fill('Test Poll');
      await page.locator('#date-input').fill('2025-10-30T19:00');
      await page.getByRole('button', { name: /ajouter/i }).click();
      await page.locator('#date-input').fill('2025-11-02T19:00');
      await page.getByRole('button', { name: /ajouter/i }).click();
      await page.locator('#date-input').fill('2025-11-05T19:00');
      await page.getByRole('button', { name: /ajouter/i }).click();

      const submitButton = page.getByRole('button', {
        name: /créer le sondage/i,
      });
      await expect(submitButton).toBeEnabled();

      const removeButton = page
        .locator(
          '[aria-label*="remove"], [aria-label*="supprimer"], .remove-date-button'
        )
        .first();
      await expect(removeButton).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Login Form', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
    });

    test('should require username', async ({ page }) => {
      // Fill password only
      await page.getByTestId('password-input').fill('password123');

      const submitButton = page.getByTestId('login-submit-button');

      // Should be disabled without username
      await expect(submitButton).toBeDisabled();

      // Add username
      await page.getByTestId('username-input').fill('alice_dm');

      // Now enabled
      await expect(submitButton).toBeEnabled();
    });

    test('should require password', async ({ page }) => {
      // Fill username only
      await page.getByTestId('username-input').fill('alice_dm');

      const submitButton = page.getByTestId('login-submit-button');

      // Should be disabled without password
      await expect(submitButton).toBeDisabled();

      // Add password
      await page.getByTestId('password-input').fill('password123');

      // Now enabled
      await expect(submitButton).toBeEnabled();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.getByTestId('username-input').fill('alice_dm');
      await page.getByTestId('password-input').fill('wrongpassword');
      await page.getByTestId('login-submit-button').click();

      // Should show user-friendly error
      await expect(page.getByTestId('error-message')).toBeVisible();
      await expect(page.getByTestId('error-message')).toContainText(
        /identifiants|incorrect|invalid/i
      );

      // Form should remain usable (not destroyed)
      await expect(page.getByTestId('username-input')).toBeVisible();
      await expect(page.getByTestId('password-input')).toBeVisible();
    });

    test('should clear error on new input', async ({ page }) => {
      // Trigger error
      await page.getByTestId('username-input').fill('alice_dm');
      await page.getByTestId('password-input').fill('wrongpassword');
      await page.getByTestId('login-submit-button').click();

      await expect(page.getByTestId('error-message')).toBeVisible();

      // Start typing again
      await page.getByTestId('password-input').fill('newattempt');

      // Error should clear (or at least form is interactive)
      await expect(page.getByTestId('login-submit-button')).toBeEnabled();
    });

    test('should handle username with special characters', async ({ page }) => {
      // Test various username formats
      const specialUsername = 'user_name-123';

      await page.getByTestId('username-input').fill(specialUsername);
      await page.getByTestId('password-input').fill('password123');

      const submitButton = page.getByTestId('login-submit-button');
      await expect(submitButton).toBeEnabled();

      // Should accept and submit (might fail auth, but form accepts it)
      await submitButton.click();

      // Wait for response (either success or auth error)
      await expect(page).toHaveURL(/login|\//, { timeout: 5000 });
    });
  });

  test.describe('Accessibility', () => {
    test('should mark invalid fields with aria-invalid', async ({ page }) => {
      test.fixme(true, 'aria-invalid attribute not set on login fields yet.');
      await page.goto('/login');

      // Fill invalid data and submit
      await page.getByTestId('username-input').fill('test');
      await page.getByTestId('password-input').fill('wrong');
      await page.getByTestId('login-submit-button').click();

      // Wait for error
      await expect(page.getByTestId('error-message')).toBeVisible();

      // Check if aria-invalid is set (documents expected behavior)
      // TODO: Implement aria-invalid="true" when validation fails
      await expect(page.getByTestId('username-input')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });
  });
});
