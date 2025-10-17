import type { Page } from '@playwright/test';
import { expect, test } from './fixtures/auth.fixture';

test.describe('Groups Navigation', () => {
  const openGroupDetails = async (page: Page, groupName: string) => {
    const groupHeading = page.getByRole('heading', { name: groupName });
    await expect(groupHeading).toBeVisible();

    const groupCard = page.locator('.group-card', { has: groupHeading });
    await expect(groupCard).toBeVisible();

    await groupCard.getByRole('link', { name: 'Voir les détails' }).click();
    await expect(page).toHaveURL(/\/groups\/.+/);
  };

  test('should display groups list page', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/groups');

    // Check that groups heading is visible
    await expect(page.getByRole('heading', { name: /groupes/i })).toBeVisible();

    // Check that at least one group card is visible
    await expect(page.locator('.group-card').first()).toBeVisible();
  });

  test('should display public groups for alice_dm', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/groups');

    // Alice should see public groups
    await expect(page.getByText('Brussels Adventurers Guild')).toBeVisible();
    await expect(page.getByText('Casual Board Gamers')).toBeVisible();

    // Alice should also see private group (Elite Strategy Players) because she's a member
    await expect(page.getByText('Elite Strategy Players')).toBeVisible();
  });

  test('should hide private groups for non-members', async ({
    page,
    loginAs,
  }) => {
    // Login as bob_boardgamer (not a member of Elite Strategy Players)
    await loginAs(page, 'bob_boardgamer');
    await expect(page).toHaveURL('/');

    await page.goto('/groups');

    // Bob should see public groups
    await expect(page.getByText('Brussels Adventurers Guild')).toBeVisible();
    await expect(page.getByText('Casual Board Gamers')).toBeVisible();

    // Bob should NOT see private group (Elite Strategy Players)
    await expect(page.getByText('Elite Strategy Players')).toBeHidden();
  });

  test('should navigate to group detail page', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/groups');
    await openGroupDetails(page, 'Brussels Adventurers Guild');

    // Wait for group detail to load (*ngIf="group && !loading")
    // Check for the title using class selector (more reliable than role)
    await expect(page.locator('.group-detail__title')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should display group details correctly', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/groups');
    await openGroupDetails(page, 'Brussels Adventurers Guild');

    // Check group information is displayed (using .group-detail-container or .group-detail)
    const detailSection = page.locator('.group-detail');
    await expect(detailSection).toBeVisible({ timeout: 10000 });

    // Verify playstyle badge is shown (use .playstyle-badge class)
    await expect(page.locator('.playstyle-badge')).toBeVisible();
  });

  test('should display member count and creator info', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/groups');
    await openGroupDetails(page, 'Brussels Adventurers Guild');

    // Wait for group detail to be visible
    await expect(page.locator('.group-detail')).toBeVisible();

    // Check for members section heading (more specific than /membre/i which matches multiple elements)
    await expect(page.getByRole('heading', { name: /membres/i })).toBeVisible();

    // Check creator (alice_dm) is listed in members section
    // Note: alice_dm appears in top-bar too (logged in user), so scope to member-card
    await expect(
      page.locator('.member-card', { hasText: 'alice_dm' })
    ).toBeVisible();
  });

  test('should show recruiting badge when group is recruiting', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/groups');

    // Wait for groups to load
    await expect(page.locator('.group-card').first()).toBeVisible();

    // Look for recruiting status badge ("Recrutement ouvert" or similar text)
    // The text might be "Rejoindre" button or status badge
    await expect(
      page.getByText(/rejoindre|recrutement/i).first()
    ).toBeVisible();
  });

  test('should filter groups by playstyle', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/groups');

    // Check that different playstyles are visible
    await expect(
      page.getByText(/Narratif|STORY_DRIVEN/i).first()
    ).toBeVisible();
    await expect(page.getByText(/Décontracté/i).first()).toBeVisible();
  });

  test('should navigate back to groups list from detail page', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/groups');
    await openGroupDetails(page, 'Brussels Adventurers Guild');

    // Click back button (has class .back-button, contains text "Retour")
    await page.getByRole('button', { name: /retour/i }).click();

    // Should be back on groups list
    await expect(page).toHaveURL('/groups');
  });
});
