import { test, expect } from '@playwright/test';

test.describe('Groups Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByPlaceholder('alice_dm').fill('alice_dm');
    await page.getByPlaceholder('••••••••••••').fill('password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL('/');
  });

  test('should display groups list page', async ({ page }) => {
    await page.goto('/groups');
    
    // Check that groups heading is visible
    await expect(page.getByRole('heading', { name: /groupes/i })).toBeVisible();
    
    // Check that at least one group card is visible
    await expect(page.locator('.group-card').first()).toBeVisible();
  });

  test('should display public groups for alice_dm', async ({ page }) => {
    await page.goto('/groups');
    
    // Alice should see public groups
    await expect(page.getByText('Brussels Adventurers Guild')).toBeVisible();
    await expect(page.getByText('Casual Board Gamers')).toBeVisible();
    
    // Alice should also see private group (Elite Strategy Players) because she's a member
    await expect(page.getByText('Elite Strategy Players')).toBeVisible();
  });

  test('should hide private groups for non-members', async ({ page }) => {
    // Logout alice
    await page.evaluate(() => localStorage.clear());
    
    // Login as bob_boardgamer (not a member of Elite Strategy Players)
    await page.goto('/login');
    await page.getByPlaceholder('alice_dm').fill('bob_boardgamer');
    await page.getByPlaceholder('••••••••••••').fill('password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL('/');
    
    await page.goto('/groups');
    
    // Bob should see public groups
    await expect(page.getByText('Brussels Adventurers Guild')).toBeVisible();
    await expect(page.getByText('Casual Board Gamers')).toBeVisible();
    
    // Bob should NOT see private group (Elite Strategy Players)
    await expect(page.getByText('Elite Strategy Players')).toBeHidden();
  });

  test('should navigate to group detail page', async ({ page }) => {
    await page.goto('/groups');
    
    // Click on a group card
    await page.getByText('Brussels Adventurers Guild').click();
    
    // Should navigate to group detail page
    await expect(page).toHaveURL(/\/groups\/.+/);
    
    // Should display group name
    await expect(page.getByRole('heading', { name: 'Brussels Adventurers Guild' })).toBeVisible();
  });

  test('should display group details correctly', async ({ page }) => {
    await page.goto('/groups');
    await page.getByText('Brussels Adventurers Guild').click();
    
    // Check group information is displayed
    await expect(page.getByText(/D&D 5e/i)).toBeVisible();
    await expect(page.getByText(/Pathfinder/i)).toBeVisible();
    await expect(page.getByText(/Brussels/i)).toBeVisible();
    await expect(page.getByText(/Narratif|STORY_DRIVEN/i)).toBeVisible();
  });

  test('should display member count and creator info', async ({ page }) => {
    await page.goto('/groups');
    await page.getByText('Brussels Adventurers Guild').click();
    
    // Check member information
    await expect(page.getByText(/membre/i)).toBeVisible();
    
    // Check creator (alice_dm)
    await expect(page.getByText('alice_dm')).toBeVisible();
  });

  test('should show recruiting badge when group is recruiting', async ({ page }) => {
    await page.goto('/groups');
    
    // Check for recruiting indicator on Brussels Adventurers Guild
    const adventurersCard = page.locator('.group-card', { hasText: 'Brussels Adventurers Guild' });
    await expect(adventurersCard.getByText(/recrutement|recruiting/i)).toBeVisible();
  });

  test('should filter groups by playstyle', async ({ page }) => {
    await page.goto('/groups');
    
    // Check that different playstyles are visible
    await expect(page.getByText(/Narratif|STORY_DRIVEN/i)).toBeVisible();
    await expect(page.getByText(/Décontracté|CASUAL/i)).toBeVisible();
  });

  test('should navigate back to groups list from detail page', async ({ page }) => {
    await page.goto('/groups');
    await page.getByText('Brussels Adventurers Guild').click();
    
    // Wait for detail page to load
    await expect(page.getByRole('heading', { name: 'Brussels Adventurers Guild' })).toBeVisible();
    
    // Click back button (browser back)
    await page.goBack();
    
    // Should be back on groups list
    await expect(page).toHaveURL('/groups');
  });
});
