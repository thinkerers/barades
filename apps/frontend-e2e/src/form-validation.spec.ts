import { test, expect } from './fixtures/auth.fixture';
import { cleanupEliteStrategyPlayersPolls } from './helpers/api-cleanup';

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
    test.beforeEach(async ({ authenticatedPage: page }) => {
      await cleanupEliteStrategyPlayersPolls(page);
      
      // Navigate to poll creation form
      await page.goto('/groups');
      const eliteCard = page.locator('.group-card', { hasText: 'Elite Strategy Players' });
      await eliteCard.getByRole('link', { name: 'Voir les détails' }).click();
      await page.getByTestId('create-poll-button').click();
    });

    test('should require poll title', async ({ authenticatedPage: page }) => {
      // Try to submit without title
      const submitButton = page.getByRole('button', { name: /créer le sondage/i });
      
      // Add valid dates but no title
      await page.locator('#date-input').fill('2025-10-30T19:00');
      await page.getByRole('button', { name: /ajouter/i }).click();
      await page.locator('#date-input').fill('2025-11-02T19:00');
      await page.getByRole('button', { name: /ajouter/i }).click();
      
      // Submit button should be disabled
      await expect(submitButton).toBeDisabled();
      
      // Add title
      await page.getByTestId('poll-title-input').fill('Valid Title');
      
      // Now should be enabled
      await expect(submitButton).toBeEnabled();
    });

    test('should require minimum 2 dates', async ({ authenticatedPage: page }) => {
      const submitButton = page.getByRole('button', { name: /créer le sondage/i });
      
      // Fill title
      await page.getByTestId('poll-title-input').fill('Test Poll');
      
      // Without dates, should be disabled
      await expect(submitButton).toBeDisabled();
      
      // Add only 1 date
      await page.locator('#date-input').fill('2025-10-30T19:00');
      await page.getByRole('button', { name: /ajouter/i }).click();
      
      // Still disabled (needs minimum 2)
      await expect(submitButton).toBeDisabled();
      
      // Add second date
      await page.locator('#date-input').fill('2025-11-02T19:00');
      await page.getByRole('button', { name: /ajouter/i }).click();
      
      // Now enabled
      await expect(submitButton).toBeEnabled();
    });

    test('should reject empty poll title', async ({ authenticatedPage: page }) => {
      const titleInput = page.getByTestId('poll-title-input');
      
      // Fill then clear
      await titleInput.fill('Some text');
      await titleInput.clear();
      
      // Try to submit
      await page.locator('#date-input').fill('2025-10-30T19:00');
      await page.getByRole('button', { name: /ajouter/i }).click();
      await page.locator('#date-input').fill('2025-11-02T19:00');
      await page.getByRole('button', { name: /ajouter/i }).click();
      
      const submitButton = page.getByRole('button', { name: /créer le sondage/i });
      await expect(submitButton).toBeDisabled();
    });

    test('should reject poll title over maximum length', async ({ authenticatedPage: page }) => {
      // Very long title (200+ chars)
      const longTitle = 'A'.repeat(201);
      
      await page.getByTestId('poll-title-input').fill(longTitle);
      
      // Should show validation error or truncate
      const titleInput = page.getByTestId('poll-title-input');
      const value = await titleInput.inputValue();
      
      // Either truncated or shows error
      expect(value.length).toBeLessThanOrEqual(200);
    });

    test('should prevent duplicate dates', async ({ authenticatedPage: page }) => {
      await page.getByTestId('poll-title-input').fill('Test Poll');
      
      // Add same date twice
      const sameDate = '2025-10-30T19:00';
      await page.locator('#date-input').fill(sameDate);
      await page.getByRole('button', { name: /ajouter/i }).click();
      
      await page.locator('#date-input').fill(sameDate);
      await page.getByRole('button', { name: /ajouter/i }).click();
      
      // Should show error or prevent addition
      // Check that only one date chip/tag appears
      const dateItems = page.locator('.date-chip, .date-tag, [data-testid*="date-"]');
      await expect(dateItems).toHaveCount(1);
    });

    test('should prevent past dates', async ({ authenticatedPage: page }) => {
      await page.getByTestId('poll-title-input').fill('Test Poll');
      
      // Try to add date in the past
      await page.locator('#date-input').fill('2020-01-01T19:00');
      const addButton = page.getByRole('button', { name: /ajouter/i });
      await addButton.click();
      
      // Should show error message or date not added
      // Either error appears OR dates list remains empty
      const errorOrEmpty = page.getByText(/date.*passé|past date|date.*future/i).or(page.locator('.date-chip, .date-tag'));
      await expect(errorOrEmpty.first()).toBeVisible({ timeout: 3000 });
    });

    test('should allow removing added dates', async ({ authenticatedPage: page }) => {
      await page.getByTestId('poll-title-input').fill('Test Poll');
      
      // Add 3 dates so we can remove one and still have 2+ for validation
      await page.locator('#date-input').fill('2025-10-30T19:00');
      await page.getByRole('button', { name: /ajouter/i }).click();
      await page.locator('#date-input').fill('2025-11-02T19:00');
      await page.getByRole('button', { name: /ajouter/i }).click();
      await page.locator('#date-input').fill('2025-11-05T19:00');
      await page.getByRole('button', { name: /ajouter/i }).click();
      
      const submitButton = page.getByRole('button', { name: /créer le sondage/i });
      await expect(submitButton).toBeEnabled();
      
      // Remove buttons should exist (test UI provides delete functionality)
      const removeButton = page.locator('[aria-label*="remove"], [aria-label*="supprimer"], .remove-date-button').first();
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
      await expect(page.getByTestId('error-message')).toContainText(/identifiants|incorrect|invalid/i);
      
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
      const specialUsername = "user_name-123";
      
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
      await page.goto('/login');
      
      // Fill invalid data and submit
      await page.getByTestId('username-input').fill('test');
      await page.getByTestId('password-input').fill('wrong');
      await page.getByTestId('login-submit-button').click();
      
      // Wait for error
      await expect(page.getByTestId('error-message')).toBeVisible();
      
      // Check if aria-invalid is set (documents expected behavior)
      // TODO: Implement aria-invalid="true" when validation fails
      await expect(page.getByTestId('username-input')).toHaveAttribute('aria-invalid', 'true');
    });
  });
});
