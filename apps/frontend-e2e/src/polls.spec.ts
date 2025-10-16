import { test, expect } from '@playwright/test';

test.describe('Poll Creation and Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as alice_dm before each test
    await page.goto('/login');
    await page.getByPlaceholder('alice_dm').fill('alice_dm');
    await page.getByPlaceholder('••••••••••••').fill('password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL('/');
  });

  test('should allow alice_dm to create a poll in Elite Strategy Players', async ({ page }) => {
    // Navigate to groups
    await page.goto('/groups');
    
    // Click on Elite Strategy Players (private group where alice is a member)
    await page.getByText('Elite Strategy Players').click();
    
    // Wait for group detail page to load
    await expect(page.getByRole('heading', { name: 'Elite Strategy Players' })).toBeVisible();
    
    // Find and click the create poll button
    await page.getByRole('button', { name: /créer.*sondage|nouveau.*sondage|add.*poll/i }).click();
    
    // Fill in poll form
    await page.getByPlaceholder(/titre|title/i).fill('Meilleure date pour session Gloomhaven ?');
    
    // Add poll dates (adjust selectors based on actual implementation)
    await page.getByLabel(/date.*1|première.*date/i).fill('2025-10-30');
    await page.getByRole('button', { name: /ajouter.*date/i }).click();
    await page.getByLabel(/date.*2|deuxième.*date/i).fill('2025-11-02');
    await page.getByRole('button', { name: /ajouter.*date/i }).click();
    await page.getByLabel(/date.*3|troisième.*date/i).fill('2025-11-05');
    
    // Submit poll
    await page.getByRole('button', { name: /créer|enregistrer|soumettre/i }).click();
    
    // Verify poll appears in the list
    await expect(page.getByText('Meilleure date pour session Gloomhaven ?')).toBeVisible();
  });

  test('should prevent bob_boardgamer from accessing Elite Strategy Players', async ({ page }) => {
    // Logout alice
    await page.evaluate(() => localStorage.clear());
    
    // Login as bob_boardgamer (not a member of Elite Strategy Players)
    await page.goto('/login');
    await page.getByPlaceholder('alice_dm').fill('bob_boardgamer');
    await page.getByPlaceholder('••••••••••••').fill('password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL('/');
    
    // Navigate to groups
    await page.goto('/groups');
    
    // Elite Strategy Players should not be visible
    await expect(page.getByText('Elite Strategy Players')).toBeHidden();
  });

  test('should show poll creation button only for group members', async ({ page }) => {
    // Navigate to Brussels Adventurers Guild (alice is a member)
    await page.goto('/groups');
    await page.getByText('Brussels Adventurers Guild').click();
    
    // Should see create poll button
    await expect(page.getByRole('button', { name: /créer.*sondage|nouveau.*sondage|add.*poll/i })).toBeVisible();
    
    // Logout and login as dave_poker (not a member of Brussels Adventurers Guild)
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.getByPlaceholder('alice_dm').fill('dave_poker');
    await page.getByPlaceholder('••••••••••••').fill('password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL('/');
    
    // Navigate to Brussels Adventurers Guild
    await page.goto('/groups');
    await page.getByText('Brussels Adventurers Guild').click();
    
    // Should NOT see create poll button (not a member)
    await expect(page.getByRole('button', { name: /créer.*sondage|nouveau.*sondage|add.*poll/i })).toBeHidden();
  });

  test('should display existing poll in group', async ({ page }) => {
    // Navigate to Brussels Adventurers Guild (has existing poll from seed data)
    await page.goto('/groups');
    await page.getByText('Brussels Adventurers Guild').click();
    
    // Check for existing poll from seed data
    await expect(page.getByText(/best date for next one-shot campaign/i)).toBeVisible();
    
    // Check poll dates are displayed
    await expect(page.getByText(/2025-10-25/)).toBeVisible();
    await expect(page.getByText(/2025-10-26/)).toBeVisible();
    await expect(page.getByText(/2025-11-01/)).toBeVisible();
  });

  test('should show vote counts for poll dates', async ({ page }) => {
    // Navigate to Brussels Adventurers Guild
    await page.goto('/groups');
    await page.getByText('Brussels Adventurers Guild').click();
    
    // Poll should show vote counts (from seed: 2025-10-25 has 2 votes, 2025-10-26 has 2 votes, 2025-11-01 has 1 vote)
    const pollCard = page.locator('app-poll-widget, .poll-widget, [data-testid="poll"]').first();
    
    // Verify vote counts are displayed
    await expect(pollCard.getByText(/\d+\s*vote/i)).toBeVisible();
  });

  test('should validate poll form fields', async ({ page }) => {
    // Navigate to a group where alice is a member
    await page.goto('/groups');
    await page.getByText('Brussels Adventurers Guild').click();
    
    // Click create poll button
    await page.getByRole('button', { name: /créer.*sondage|nouveau.*sondage|add.*poll/i }).click();
    
    // Try to submit without filling title
    await page.getByRole('button', { name: /créer|enregistrer|soumettre/i }).click();
    
    // Should show validation error or button should be disabled
    const submitButton = page.getByRole('button', { name: /créer|enregistrer|soumettre/i });
    await expect(submitButton).toBeDisabled();
  });

  test('should allow member to create multiple polls in same group', async ({ page }) => {
    // Navigate to Elite Strategy Players
    await page.goto('/groups');
    await page.getByText('Elite Strategy Players').click();
    
    // Create first poll
    await page.getByRole('button', { name: /créer.*sondage|nouveau.*sondage|add.*poll/i }).click();
    await page.getByPlaceholder(/titre|title/i).fill('Session Twilight Imperium ?');
    await page.getByLabel(/date.*1|première.*date/i).fill('2025-11-10');
    await page.getByRole('button', { name: /créer|enregistrer|soumettre/i }).click();
    
    // Wait for first poll to be created
    await expect(page.getByText('Session Twilight Imperium ?')).toBeVisible();
    
    // Create second poll
    await page.getByRole('button', { name: /créer.*sondage|nouveau.*sondage|add.*poll/i }).click();
    await page.getByPlaceholder(/titre|title/i).fill('Session Mage Knight ?');
    await page.getByLabel(/date.*1|première.*date/i).fill('2025-11-15');
    await page.getByRole('button', { name: /créer|enregistrer|soumettre/i }).click();
    
    // Both polls should be visible
    await expect(page.getByText('Session Twilight Imperium ?')).toBeVisible();
    await expect(page.getByText('Session Mage Knight ?')).toBeVisible();
  });
});
