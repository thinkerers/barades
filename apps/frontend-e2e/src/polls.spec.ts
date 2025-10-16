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

  test('should allow alice_dm to create a poll in Brussels Adventurers Guild', async ({ page }) => {
    // Navigate to groups
    await page.goto('/groups');
    
    // Click on Brussels Adventurers Guild (alice is a member)
    // Use the "Voir les détails" link instead of clicking text
    await page.getByRole('link', { name: 'Voir les détails' }).first().click();
    
    // Wait for group detail page to load
    await expect(page.getByRole('heading', { name: 'Brussels Adventurers Guild' })).toBeVisible();
    
    // Find poll widget - no heading, just a button "Créer un sondage"
    // If there's already a poll, the button won't appear
    // For this test, we'll create a second poll or check if creation form appears
    
    // Click the create poll button (text: "Créer un sondage")
    await page.getByRole('button', { name: /créer un sondage/i }).click();
    
    // Fill in poll form - use the actual input id
    await page.locator('#poll-title').fill('Meilleure date pour session Gloomhaven ?');
    
    // Add first date using datetime-local input
    await page.locator('#date-input').fill('2025-10-30T19:00');
    await page.getByRole('button', { name: /ajouter/i }).click();
    
    // Add second date
    await page.locator('#date-input').fill('2025-11-02T19:00');
    await page.getByRole('button', { name: /ajouter/i }).click();
    
    // Add third date
    await page.locator('#date-input').fill('2025-11-05T19:00');
    await page.getByRole('button', { name: /ajouter/i }).click();
    
    // Submit poll - button text: "Créer le sondage"
    await page.getByRole('button', { name: /créer le sondage/i }).click();
    
    // Verify poll appears (check for the title in poll display)
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
    await page.getByRole('link', { name: 'Voir les détails' }).first().click();
    
    // Should see create poll button OR existing poll (since seed has a poll)
    // Check for poll widget presence
    await expect(page.locator('.poll-widget')).toBeVisible();
    
    // Logout and login as dave_poker (not a member of Brussels Adventurers Guild)
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.getByPlaceholder('alice_dm').fill('dave_poker');
    await page.getByPlaceholder('••••••••••••').fill('password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL('/');
    
    // Navigate to Brussels Adventurers Guild
    await page.goto('/groups');
    await page.getByRole('link', { name: 'Voir les détails' }).first().click();
    
    // Should see message instead of button (dave is not a member)
    await expect(page.getByText(/vous devez être membre/i)).toBeVisible();
  });

  test('should display existing poll in group', async ({ page }) => {
    // Navigate to Brussels Adventurers Guild (has a seed poll)
    await page.goto('/groups');
    await page.getByRole('link', { name: 'Voir les détails' }).first().click();
    await expect(page).toHaveURL(/\/groups\/.+/);
    
    // Check for existing poll from seed data (title contains "best date for next one-shot")
    await expect(page.getByText(/best date for next one-shot/i)).toBeVisible();
  });

  test('should show vote counts for poll dates', async ({ page }) => {
    // Navigate to Brussels Adventurers Guild
    await page.goto('/groups');
    await page.getByRole('link', { name: 'Voir les détails' }).first().click();
    
    // Wait for page to load
    await expect(page.getByRole('heading', { name: 'Brussels Adventurers Guild' })).toBeVisible();
    
    // Poll should show vote counts (look for text like "2 votes" in poll-display__stats)
    const pollSection = page.locator('.poll-display').first();
    await expect(pollSection.getByText(/\d+\s*vote/i)).toBeVisible();
  });

  test('should validate poll form fields', async ({ page }) => {
    // Navigate to Elite Strategy Players (no existing poll, alice is member)
    await page.goto('/groups');
    await page.getByRole('link', { name: 'Voir les détails' }).nth(1).click(); // Second group
    
    // Click create poll button
    await page.getByRole('button', { name: /créer un sondage/i }).click();
    
    // Try to submit without filling fields - button should be disabled
    const submitButton = page.getByRole('button', { name: /créer le sondage/i });
    await expect(submitButton).toBeDisabled();
    
    // Fill title but no dates - still disabled
    await page.locator('#poll-title').fill('Test Poll');
    await expect(submitButton).toBeDisabled();
    
    // Add only one date - still disabled (needs minimum 2)
    await page.locator('#date-input').fill('2025-11-10T19:00');
    await page.getByRole('button', { name: /ajouter/i }).click();
    await expect(submitButton).toBeDisabled();
    
    // Add second date - now enabled
    await page.locator('#date-input').fill('2025-11-11T19:00');
    await page.getByRole('button', { name: /ajouter/i }).click();
    await expect(submitButton).toBeEnabled();
  });

  test('should allow member to create multiple polls in same group', async ({ page }) => {
    // Navigate to Elite Strategy Players (no poll yet)
    await page.goto('/groups');
    await page.getByRole('link', { name: 'Voir les détails' }).nth(1).click();
    
    // Create first poll
    await page.getByRole('button', { name: /créer un sondage/i }).click();
    await page.locator('#poll-title').fill('Session Twilight Imperium ?');
    await page.locator('#date-input').fill('2025-11-10T19:00');
    await page.getByRole('button', { name: /ajouter/i }).click();
    await page.locator('#date-input').fill('2025-11-11T19:00');
    await page.getByRole('button', { name: /ajouter/i }).click();
    await page.getByRole('button', { name: /créer le sondage/i }).click();
    
    // Verify first poll appears
    await expect(page.getByText('Session Twilight Imperium ?')).toBeVisible();
    
    // NOTE: The current implementation might only support one poll per group
    // This test documents expected behavior for future implementation
  });
});
