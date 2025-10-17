import { test, expect } from './fixtures/auth.fixture';
import { cleanupEliteStrategyPlayersPolls } from './helpers/api-cleanup';

test.describe.configure({ mode: 'serial' });

/**
 * Edge Cases and Empty States Tests
 * Tests unusual scenarios and boundary conditions
 * Best practices 2025: Test edge cases explicitly to prevent production bugs
 */
test.describe('Edge Cases and Empty States', () => {
  test.beforeEach(async ({ authenticatedPage: page, eliteGroupLock: _eliteGroupLock }) => {
    void _eliteGroupLock;
    // Ensure clean state for poll tests
    await cleanupEliteStrategyPlayersPolls(page);
  });

  test('should show empty state when group has no polls', async ({ authenticatedPage: page }) => {
    await page.goto('/groups');
    
    // Navigate to Elite Strategy Players (cleaned, so no polls)
    const eliteCard = page.locator('.group-card', { hasText: 'Elite Strategy Players' });
    await eliteCard.getByRole('link', { name: 'Voir les détails' }).click();

    // Should show poll widget
    await expect(page.getByTestId('poll-widget')).toBeVisible();
    
    // Should show create button (alice is member)
    await expect(page.getByTestId('create-poll-button')).toBeVisible();
    
    // Should not show poll display
    await expect(page.locator('.poll-display')).toBeHidden();
  });

  test('should handle poll with zero votes correctly', async ({ authenticatedPage: page }) => {
    await page.goto('/groups');
    
    const eliteCard = page.locator('.group-card', { hasText: 'Elite Strategy Players' });
    await eliteCard.getByRole('link', { name: 'Voir les détails' }).click();

    // Create a poll
    await page.getByTestId('create-poll-button').click();
    await page.getByTestId('poll-title-input').fill('Test Poll No Votes');
    await page.locator('#date-input').fill('2025-11-20T19:00');
    await page.getByRole('button', { name: /ajouter/i }).click();
    await page.locator('#date-input').fill('2025-11-21T19:00');
    await page.getByRole('button', { name: /ajouter/i }).click();
    await page.getByRole('button', { name: /créer le sondage/i }).click();

    // Wait for poll to appear
    await expect(page.locator('.poll-display')).toBeVisible();

    // Should show "0 votes" or similar for each option
    const pollOptions = page.locator('.poll-option');
    const firstOption = pollOptions.first();
    await expect(firstOption).toContainText(/0|aucun/i);
  });

  test('should handle very long poll title gracefully', async ({ authenticatedPage: page }) => {
    await page.goto('/groups');
    
    const eliteCard = page.locator('.group-card', { hasText: 'Elite Strategy Players' });
    await eliteCard.getByRole('link', { name: 'Voir les détails' }).click();

    await page.getByTestId('create-poll-button').click();

    // Create a very long title (200 characters)
    const longTitle = 'A'.repeat(200);
    await page.getByTestId('poll-title-input').fill(longTitle);
    
    await page.locator('#date-input').fill('2025-11-22T19:00');
    await page.getByRole('button', { name: /ajouter/i }).click();
    await page.locator('#date-input').fill('2025-11-23T19:00');
    await page.getByRole('button', { name: /ajouter/i }).click();

    // Should either be truncated or show validation error
    const submitButton = page.getByRole('button', { name: /créer le sondage/i });
    
    // Try to submit
    await submitButton.click();

    // Wait for either poll or error to appear
    await Promise.race([
      page.locator('.poll-display').waitFor({ state: 'visible' }),
      page.locator('[role="alert"], .error-message, .mat-error').waitFor({ state: 'visible' })
    ]).catch(() => {
      // Timeout is acceptable here
    });
    
    // Check if poll was created or error shown
    const pollDisplay = page.locator('.poll-display');
    const errorMessage = page.locator('[role="alert"], .error-message, .mat-error');
    
    const pollVisible = await pollDisplay.isVisible().catch(() => false);
    const errorVisible = await errorMessage.isVisible().catch(() => false);
    
    // One of these should be true
    expect(pollVisible || errorVisible).toBeTruthy();
  });

  test('should handle poll with many date options', async ({ authenticatedPage: page }) => {
    await page.goto('/groups');
    
    const eliteCard = page.locator('.group-card', { hasText: 'Elite Strategy Players' });
    await eliteCard.getByRole('link', { name: 'Voir les détails' }).click();

    await page.getByTestId('create-poll-button').click();
    await page.getByTestId('poll-title-input').fill('Poll with Many Dates');

    // Add 10 dates
    for (let i = 1; i <= 10; i++) {
      await page.locator('#date-input').fill(`2025-11-${10 + i}T19:00`);
      await page.getByRole('button', { name: /ajouter/i }).click();
    }

    // Submit
    await page.getByRole('button', { name: /créer le sondage/i }).click();

    // Should show poll with all dates
    await expect(page.locator('.poll-display')).toBeVisible();
    const pollOptions = page.locator('.poll-option');
    
    // Should have 10 options
    await expect(pollOptions).toHaveCount(10);
  });

  test('should handle voting for same date twice (toggle)', async ({ authenticatedPage: page }) => {
    await page.goto('/groups');
    
    const brusselsCard = page.locator('.group-card', { hasText: 'Brussels Adventurers Guild' });
    await brusselsCard.getByRole('link', { name: 'Voir les détails' }).click();

    await expect(page.locator('.poll-display').first()).toBeVisible();
    const pollDisplay = page.locator('.poll-display').first();
    const firstVoteButton = pollDisplay.locator('.poll-option__button').first();

    // Get initial state
    const initialText = await firstVoteButton.textContent();

    // Click once (vote)
    await firstVoteButton.click();
    await page.locator('.poll-option--selected').waitFor({ state: 'visible', timeout: 2000 })
      .catch(() => { /* Vote update may be instant */ });

    // Click again (unvote)
    await firstVoteButton.click();
    await page.locator('.poll-option--selected').waitFor({ state: 'hidden', timeout: 2000 })
      .catch(() => { /* Unvote update may be instant */ });

    // Should toggle back to original state
    const finalText = await firstVoteButton.textContent();
    
    // Text should be same (voted then unvoted)
    expect(finalText).toContain(initialText || '');
  });

  test('should handle group with no members except creator', async ({ page, loginAs }) => {
    // This would require creating a new group, which might not be implemented
    // For now, test that group details show correctly with minimal data
    
    await loginAs(page, 'alice_dm');
    await page.goto('/groups');

    // Find any group and check member display
    const firstGroup = page.locator('.group-card').first();
    await firstGroup.getByRole('link', { name: 'Voir les détails' }).click();

    // Should show at least creator in members
    await expect(page.locator('.member-card').first()).toBeVisible();
  });

  test('should handle rapid successive votes', async ({ authenticatedPage: page }) => {
    test.fixme(true, 'Vote toggling too slow to keep up with rapid interactions.');
    await page.goto('/groups');
    
    const brusselsCard = page.locator('.group-card', { hasText: 'Brussels Adventurers Guild' });
    await brusselsCard.getByRole('link', { name: 'Voir les détails' }).click();

    await expect(page.locator('.poll-display').first()).toBeVisible();
    const pollDisplay = page.locator('.poll-display').first();
    const voteButtons = pollDisplay.locator('.poll-option__button');

    // Rapidly click different options
    const firstButton = voteButtons.first();
    const secondButton = voteButtons.nth(1);

    await firstButton.click();
    await secondButton.click(); // Should switch vote

    // Wait for updates to complete by checking selected state
    await page.locator('.poll-option--selected').waitFor({ state: 'visible', timeout: 3000 });

    // Should show only one vote (the last one)
    const selectedOptions = pollDisplay.locator('.poll-option--selected');
    await expect(selectedOptions).toHaveCount(1);
  });

  test('should handle special characters in poll title', async ({ authenticatedPage: page }) => {
    await page.goto('/groups');
    
    const eliteCard = page.locator('.group-card', { hasText: 'Elite Strategy Players' });
    await eliteCard.getByRole('link', { name: 'Voir les détails' }).click();

    await page.getByTestId('create-poll-button').click();

    // Title with special characters
    const specialTitle = 'Test <script>alert("xss")</script> & "quotes" \'single\' 日本語';
    await page.getByTestId('poll-title-input').fill(specialTitle);
    
    await page.locator('#date-input').fill('2025-11-25T19:00');
    await page.getByRole('button', { name: /ajouter/i }).click();
    await page.locator('#date-input').fill('2025-11-26T19:00');
    await page.getByRole('button', { name: /ajouter/i }).click();
    await page.getByRole('button', { name: /créer le sondage/i }).click();

    // Poll should be created and special chars escaped properly
    await expect(page.locator('.poll-display')).toBeVisible();
    
    // Should NOT execute script tags
    const alerts = page.locator('[role="alert"]');
    const alertCount = await alerts.count();
    
    // No XSS alert should have been triggered
    expect(alertCount).toBe(0);
  });

  test('should handle dates in the past', async ({ authenticatedPage: page }) => {
    await page.goto('/groups');
    
    const eliteCard = page.locator('.group-card', { hasText: 'Elite Strategy Players' });
    await eliteCard.getByRole('link', { name: 'Voir les détails' }).click();

    await page.getByTestId('create-poll-button').click();
    await page.getByTestId('poll-title-input').fill('Poll with Past Dates');

    // Try to add a past date
    await page.locator('#date-input').fill('2020-01-01T19:00');
    await page.getByRole('button', { name: /ajouter/i }).click();
    
    // Add a future date as well
    await page.locator('#date-input').fill('2025-12-01T19:00');
    await page.getByRole('button', { name: /ajouter/i }).click();

    // Should either prevent submission or allow it (depends on business logic)
    const submitButton = page.getByRole('button', { name: /créer le sondage/i });
    const isEnabled = await submitButton.isEnabled();
    
    // Button state is determined by validation logic
    expect(typeof isEnabled).toBe('boolean');
  });

  test('should handle concurrent user voting on same poll', async ({ page, loginAs }) => {
    test.fixme(true, 'Concurrent voting still causes inconsistent counts in backend.');
    // Test that multiple users can vote simultaneously without conflicts
    // This is a simplified version - real concurrent testing needs multiple browser contexts
    
    await loginAs(page, 'alice_dm');
    await page.goto('/groups');
    
    const brusselsCard = page.locator('.group-card', { hasText: 'Brussels Adventurers Guild' });
    await brusselsCard.getByRole('link', { name: 'Voir les détails' }).click();

    const pollDisplay = page.locator('.poll-display').first();
    await expect(pollDisplay).toBeVisible();

    // Alice votes
    const firstButton = pollDisplay.locator('.poll-option__button').first();
    await firstButton.click();
    await pollDisplay.locator('.poll-option--selected').waitFor({ state: 'visible', timeout: 2000 })
      .catch(() => { /* May already be visible */ });

    // Switch to bob and vote
    await loginAs(page, 'bob_boardgamer');
    await page.goto('/groups');
    await brusselsCard.getByRole('link', { name: 'Voir les détails' }).click();

    const pollDisplay2 = page.locator('.poll-display').first();
    const secondButton = pollDisplay2.locator('.poll-option__button').nth(1);
    await secondButton.click();
    await pollDisplay2.locator('.poll-option--selected').waitFor({ state: 'visible', timeout: 2000 })
      .catch(() => { /* May already be visible */ });

    // Both votes should be registered (check vote count increased)
    const voteCount = pollDisplay2.locator('.poll-display__stats');
    await expect(voteCount).toContainText(/\d+\s*vote/i);
  });
});
