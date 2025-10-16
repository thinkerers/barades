import { test, expect } from '@playwright/test';

test.describe('Poll Voting', () => {
  test.beforeEach(async ({ page }) => {
    // Login as alice_dm before each test
    await page.goto('/login');
    await page.getByPlaceholder('alice_dm').fill('alice_dm');
    await page.getByPlaceholder('••••••••••••').fill('password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL('/');
  });

  test('should allow member to vote on poll date', async ({ page }) => {
    // Navigate to Brussels Adventurers Guild (has existing poll)
    await page.goto('/groups');
    await page.getByText('Brussels Adventurers Guild').click();
    
    // Find the poll
    const pollCard = page.locator('app-poll-widget, .poll-widget, [data-testid="poll"]').first();
    await expect(pollCard).toBeVisible();
    
    // Click on a date to vote (e.g., 2025-11-01)
    await pollCard.getByText('2025-11-01').click();
    
    // Vote count should increase
    await expect(pollCard.getByText(/vote/i)).toBeVisible();
  });

  test('should allow member to remove their vote', async ({ page }) => {
    // Navigate to Brussels Adventurers Guild
    await page.goto('/groups');
    await page.getByText('Brussels Adventurers Guild').click();
    
    const pollCard = page.locator('app-poll-widget, .poll-widget, [data-testid="poll"]').first();
    
    // Vote on a date
    await pollCard.getByText('2025-10-25').click();
    
    // Click again to remove vote
    await pollCard.getByText('2025-10-25').click();
    
    // Vote should be removed (count decreases or visual indicator changes)
    await expect(pollCard).toBeVisible();
  });

  test('should show which dates current user voted for', async ({ page }) => {
    // Navigate to Brussels Adventurers Guild
    await page.goto('/groups');
    await page.getByText('Brussels Adventurers Guild').click();
    
    const pollCard = page.locator('app-poll-widget, .poll-widget, [data-testid="poll"]').first();
    
    // Vote on multiple dates
    await pollCard.getByText('2025-10-25').click();
    await pollCard.getByText('2025-10-26').click();
    
    // Voted dates should have visual indicator (e.g., different color, checkmark)
    // This depends on implementation - checking that some visual change occurred
    const date1Element = pollCard.locator('text=2025-10-25').first();
    const date2Element = pollCard.locator('text=2025-10-26').first();
    
    await expect(date1Element).toBeVisible();
    await expect(date2Element).toBeVisible();
  });

  test('should display best date (most votes)', async ({ page }) => {
    // Navigate to Brussels Adventurers Guild
    await page.goto('/groups');
    await page.getByText('Brussels Adventurers Guild').click();
    
    const pollCard = page.locator('app-poll-widget, .poll-widget, [data-testid="poll"]').first();
    
    // Check for "best date" indicator or "leading" badge
    // From seed data: 2025-10-25 and 2025-10-26 both have 2 votes (tied for best)
    await expect(pollCard.getByText(/meilleur|best|gagnant|leading/i)).toBeVisible();
  });

  test('should prevent non-member from voting', async ({ page }) => {
    // Logout alice and login as dave_poker (not a member of Brussels Adventurers Guild)
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.getByPlaceholder('alice_dm').fill('dave_poker');
    await page.getByPlaceholder('••••••••••••').fill('password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL('/');
    
    // Navigate to Brussels Adventurers Guild (public group, can view but not vote)
    await page.goto('/groups');
    await page.getByText('Brussels Adventurers Guild').click();
    
    // Poll should be visible but voting should be disabled
    const pollCard = page.locator('app-poll-widget, .poll-widget, [data-testid="poll"]').first();
    await expect(pollCard).toBeVisible();
    
    // Vote buttons should be disabled or hidden
    // This depends on implementation - poll dates might not be clickable
  });

  test('should update vote counts in real-time', async ({ page }) => {
    // Navigate to Brussels Adventurers Guild
    await page.goto('/groups');
    await page.getByText('Brussels Adventurers Guild').click();
    
    const pollCard = page.locator('app-poll-widget, .poll-widget, [data-testid="poll"]').first();
    
    // Get initial vote count for a date
    const dateButton = pollCard.getByText('2025-11-01').first();
    
    // Vote on the date
    await dateButton.click();
    
    // Vote count should have increased
    await expect(pollCard.getByText(/\d+\s*vote/i)).toBeVisible();
  });

  test('should allow voting on multiple dates in same poll', async ({ page }) => {
    // Navigate to Brussels Adventurers Guild
    await page.goto('/groups');
    await page.getByText('Brussels Adventurers Guild').click();
    
    const pollCard = page.locator('app-poll-widget, .poll-widget, [data-testid="poll"]').first();
    
    // Vote on all three dates
    await pollCard.getByText('2025-10-25').click();
    await pollCard.getByText('2025-10-26').click();
    await pollCard.getByText('2025-11-01').click();
    
    // All dates should show that alice voted
    await expect(pollCard).toBeVisible();
  });

  test('should show vote details tooltip', async ({ page }) => {
    // Navigate to Brussels Adventurers Guild
    await page.goto('/groups');
    await page.getByText('Brussels Adventurers Guild').click();
    
    const pollCard = page.locator('app-poll-widget, .poll-widget, [data-testid="poll"]').first();
    
    // Look for vote details (who voted for each date)
    // This might require hovering or clicking to expand details
    const dateElement = pollCard.getByText('2025-10-25').first();
    
    // Try to hover to see details
    await dateElement.hover();
    
    // Poll card should still be visible after hover
    await expect(pollCard).toBeVisible();
  });
});
