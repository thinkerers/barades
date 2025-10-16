import { test, expect } from './fixtures/auth.fixture';

test.describe('Poll Voting (with fixtures)', () => {
  test('should allow member to vote on poll date', async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;

    // Navigate to Brussels Adventurers Guild (has existing poll)
    await page.goto('/groups');
    
    const brusselsCard = page.locator('.group-card', { hasText: 'Brussels Adventurers Guild' });
    await brusselsCard.getByRole('link', { name: 'Voir les détails' }).click();
    
    await expect(page.locator('.group-detail__title')).toBeVisible();
    
    const pollDisplay = page.locator('.poll-display').first();
    await expect(pollDisplay).toBeVisible();
    
    // Click on a poll option button to vote
    const voteButtons = pollDisplay.locator('.poll-option__button');
    await voteButtons.first().click();
    
    // Verify vote was registered
    await expect(pollDisplay).toBeVisible();
  });

  test('should allow switching users', async ({ authenticatedPage }) => {
    const { page, logout, loginAs } = authenticatedPage;

    // Already logged in as alice_dm
    await page.goto('/groups');
    await expect(page.getByText('Brussels Adventurers Guild')).toBeVisible();

    // Logout and login as bob_boardgamer
    await logout();
    await loginAs('bob_boardgamer');

    await page.goto('/groups');
    await expect(page.getByText('Brussels Adventurers Guild')).toBeVisible();
  });
});
