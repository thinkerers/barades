import type { Page } from '@playwright/test';
import { expect, test } from './fixtures/auth.fixture';

test.describe('Groups Navigation', () => {
  const openGroupDetails = async (page: Page, groupName: string) => {
    const groupHeading = page.getByRole('heading', { name: groupName });
    await expect(groupHeading).toBeVisible();

    const groupCard = page.locator('.group-card', { has: groupHeading });
    await expect(groupCard).toBeVisible();

    await groupCard.getByRole('button', { name: 'Voir les détails' }).click();
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
    createPollSandbox,
  }) => {
    const sandbox = await createPollSandbox({
      members: ['alice_dm'],
      isPublic: true,
      recruiting: true,
    });

    try {
      await page.goto('/groups');

      const groupCard = page.getByTestId(`group-card-${sandbox.groupId}`);
      await expect(groupCard).toBeVisible();
      await expect(groupCard.getByText(sandbox.groupName)).toBeVisible();
    } finally {
      await sandbox.cleanup();
    }
  });

  test('should hide private groups for non-members', async ({
    page,
    loginAs,
    createPollSandbox,
  }) => {
    const privateSandbox = await createPollSandbox({
      members: ['alice_dm'],
      isPublic: false,
      recruiting: true,
    });

    try {
      await loginAs(page, 'bob_boardgamer');
      await expect(page).toHaveURL('/');

      await page.goto('/groups');

      await expect(
        page.getByTestId(`group-card-${privateSandbox.groupId}`)
      ).toHaveCount(0);
      await expect(page.getByText(privateSandbox.groupName)).toHaveCount(0);
    } finally {
      await privateSandbox.cleanup();
    }
  });

  test('should navigate to group detail page', async ({
    authenticatedPage: page,
    createPollSandbox,
  }) => {
    const sandbox = await createPollSandbox({
      members: ['alice_dm'],
      isPublic: true,
      recruiting: true,
    });

    try {
      await page.goto('/groups');
      await openGroupDetails(page, sandbox.groupName);

      await expect(page.locator('.group-detail__title')).toBeVisible({
        timeout: 10000,
      });
    } finally {
      await sandbox.cleanup();
    }
  });

  test('should display group details correctly', async ({
    authenticatedPage: page,
    createPollSandbox,
  }) => {
    const sandbox = await createPollSandbox({
      members: ['alice_dm'],
      isPublic: true,
      recruiting: true,
      playstyle: 'CASUAL',
    });

    try {
      await page.goto('/groups');
      await openGroupDetails(page, sandbox.groupName);

      const detailSection = page.locator('.group-detail');
      await expect(detailSection).toBeVisible({ timeout: 10000 });

      await expect(page.locator('.playstyle-badge')).toBeVisible();
      await expect(
        detailSection.getByText(/Décontracté|CASUAL/i)
      ).toBeVisible();
    } finally {
      await sandbox.cleanup();
    }
  });

  test('should display member count and creator info', async ({
    authenticatedPage: page,
    createPollSandbox,
  }) => {
    const sandbox = await createPollSandbox({
      members: ['alice_dm', 'carol_newbie', 'bob_boardgamer'],
      isPublic: true,
    });

    try {
      await page.goto('/groups');
      await openGroupDetails(page, sandbox.groupName);

      await expect(page.locator('.group-detail')).toBeVisible();

      await expect(
        page.getByRole('heading', { name: /membres/i })
      ).toBeVisible();

      const membersSection = page.locator('.member-card');
      await expect(
        membersSection.filter({ hasText: 'alice_dm' })
      ).toBeVisible();
      const countBadge = page
        .locator('.group-detail__section')
        .filter({ has: page.getByRole('heading', { name: /membres/i }) })
        .locator('.count-badge');
      await expect(countBadge.first()).toContainText('3');
    } finally {
      await sandbox.cleanup();
    }
  });

  test('should show recruiting badge and join action when group is recruiting', async ({
    page,
    loginAs,
    createPollSandbox,
  }) => {
    const sandbox = await createPollSandbox({
      members: ['bob_boardgamer'],
      isPublic: true,
      recruiting: true,
    });

    try {
      await loginAs(page, 'carol_newbie');
      await expect(page).toHaveURL('/');

      await page.goto('/groups');

      const groupCard = page.getByTestId(`group-card-${sandbox.groupId}`);
      await expect(groupCard).toBeVisible();

      await expect(groupCard.getByText('Recrute')).toBeVisible();
      const joinButton = groupCard.getByRole('button', { name: 'Rejoindre' });
      await expect(joinButton).toBeVisible();
      await expect(joinButton).toBeEnabled();
    } finally {
      await sandbox.cleanup();
    }
  });

  test('should prompt login and auto-join after authentication', async ({
    page,
    createPollSandbox,
  }) => {
    const sandbox = await createPollSandbox({
      members: ['bob_boardgamer'],
      isPublic: true,
      recruiting: true,
    });

    try {
      await page.goto('/groups');

      const groupCard = page.getByTestId(`group-card-${sandbox.groupId}`);
      await expect(groupCard).toBeVisible();

      await groupCard.getByRole('button', { name: 'Rejoindre' }).click();

      await expect(page).toHaveURL(/\/login\?returnUrl=/);
      const loginRedirectUrl = page.url();
      expect(loginRedirectUrl).toContain('autoJoin%3D1');

      await page.getByTestId('username-input').fill('carol_newbie');
      await page.getByTestId('password-input').fill('password123');
      await page.getByTestId('login-submit-button').click();

      await page.waitForURL(new RegExp(`/groups/${sandbox.groupId}`), {
        timeout: 15000,
      });

      await expect(
        page.getByRole('button', { name: /quitter le groupe/i })
      ).toBeVisible({ timeout: 10000 });
    } finally {
      await sandbox.cleanup();
    }
  });

  test('should filter groups by playstyle', async ({
    authenticatedPage: page,
    createPollSandbox,
  }) => {
    const casualGroup = await createPollSandbox({
      members: ['alice_dm'],
      isPublic: true,
      playstyle: 'CASUAL',
    });

    const competitiveGroup = await createPollSandbox({
      members: ['alice_dm'],
      isPublic: true,
      playstyle: 'COMPETITIVE',
    });

    try {
      await page.goto('/groups');

      await expect(
        page
          .getByTestId(`group-card-${casualGroup.groupId}`)
          .getByText(/Décontracté|CASUAL/i)
      ).toBeVisible();

      await expect(
        page
          .getByTestId(`group-card-${competitiveGroup.groupId}`)
          .getByText(/Compétitif|COMPETITIVE/i)
      ).toBeVisible();
    } finally {
      await casualGroup.cleanup();
      await competitiveGroup.cleanup();
    }
  });

  test('should navigate back to groups list from detail page', async ({
    authenticatedPage: page,
    createPollSandbox,
  }) => {
    const sandbox = await createPollSandbox({
      members: ['alice_dm'],
      isPublic: true,
    });

    try {
      await page.goto('/groups');
      await openGroupDetails(page, sandbox.groupName);

      await page.getByRole('button', { name: /retour/i }).click();

      await expect(page).toHaveURL('/groups');
    } finally {
      await sandbox.cleanup();
    }
  });
});
