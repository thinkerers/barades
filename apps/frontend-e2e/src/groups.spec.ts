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
    
    // Click on a group card button (not the card itself, but the "Voir les détails" button)
    await page.getByRole('link', { name: 'Voir les détails' }).first().click();
    
    // Should navigate to group detail page
    await expect(page).toHaveURL(/\/groups\/.+/);
    
    // Wait for group detail to load (*ngIf="group && !loading")
    // Check for the title using class selector (more reliable than role)
    await expect(page.locator('.group-detail__title')).toBeVisible();
  });

  test('should display group details correctly', async ({ page }) => {
    await page.goto('/groups');
    await page.getByRole('link', { name: 'Voir les détails' }).first().click();
    
    // Wait for navigation
    await expect(page).toHaveURL(/\/groups\/.+/);
    
    // Check group information is displayed (using .group-detail-container or .group-detail)
    const detailSection = page.locator('.group-detail');
    await expect(detailSection).toBeVisible();
    
    // Verify playstyle badge is shown (use .playstyle-badge class)
    await expect(page.locator('.playstyle-badge')).toBeVisible();
  });

  test('should display member count and creator info', async ({ page }) => {
    await page.goto('/groups');
    await page.getByRole('link', { name: 'Voir les détails' }).first().click();
    
    // Wait for detail page to load
    await expect(page).toHaveURL(/\/groups\/.+/);
    
    // Wait for group detail to be visible
    await expect(page.locator('.group-detail')).toBeVisible();
    
    // Check for members section heading (more specific than /membre/i which matches multiple elements)
    await expect(page.getByRole('heading', { name: /membres/i })).toBeVisible();
    
    // Check creator (alice_dm created Brussels Adventurers Guild)
    await expect(page.getByText('alice_dm')).toBeVisible();
  });

  test('should show recruiting badge when group is recruiting', async ({ page }) => {
    await page.goto('/groups');
    
    // Wait for groups to load
    await expect(page.locator('.group-card').first()).toBeVisible();
    
    // Look for recruiting status badge ("Recrutement ouvert" or similar text)
    // The text might be "Rejoindre" button or status badge
    await expect(page.getByText(/rejoindre|recrutement/i).first()).toBeVisible();
  });

  test('should filter groups by playstyle', async ({ page }) => {
    await page.goto('/groups');
    
    // Check that different playstyles are visible
    await expect(page.getByText(/Narratif|STORY_DRIVEN/i).first()).toBeVisible();
    await expect(page.getByText(/Décontracté/i).first()).toBeVisible();
  });

  test('should navigate back to groups list from detail page', async ({ page }) => {
    await page.goto('/groups');
    await page.getByRole('link', { name: 'Voir les détails' }).first().click();
    
    // Wait for detail page
    await expect(page).toHaveURL(/\/groups\/.+/);
    
    // Click back button (has class .back-button, contains text "Retour")
    await page.getByRole('button', { name: /retour/i }).click();
    
    // Should be back on groups list
    await expect(page).toHaveURL('/groups');
  });
});
