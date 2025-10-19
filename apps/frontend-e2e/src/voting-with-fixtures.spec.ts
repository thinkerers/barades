import type { Page } from '@playwright/test';
import { expect, test } from './fixtures/auth.fixture';
import type { PollSandboxContext } from './helpers/test-data';

const openSandboxGroupDetail = async (
  page: Page,
  sandbox: PollSandboxContext
) => {
  await page.goto('/groups');

  const groupCard = page.getByTestId(`group-card-${sandbox.groupId}`);
  await expect(groupCard).toBeVisible({ timeout: 10000 });

  await groupCard.getByRole('button', { name: 'Voir les détails' }).click();
  await expect(page.locator('.group-detail__title')).toBeVisible({
    timeout: 10000,
  });
};

test.describe('Poll Voting (with fixtures)', () => {
  test('should allow member to vote on poll date', async ({
    authenticatedPage: page,
    createPollSandbox,
    createPollForGroup,
  }) => {
    const sandbox = await createPollSandbox({
      members: ['alice_dm', 'bob_boardgamer'],
      isPublic: true,
    });
    await createPollForGroup(sandbox.groupId);

    try {
      await openSandboxGroupDetail(page, sandbox);

      const pollDisplay = page.locator('.poll-display').first();
      await expect(pollDisplay).toBeVisible();

      const voteButton = pollDisplay.locator('.poll-option__button').first();
      const [voteResponse] = await Promise.all([
        page.waitForResponse((response) => {
          return (
            response.request().method() === 'PATCH' &&
            response.url().includes('/polls/') &&
            response.url().includes('/vote')
          );
        }),
        voteButton.click(),
      ]);

      expect(voteResponse.status()).toBe(200);
      await expect(pollDisplay.locator('.poll-option--selected')).toBeVisible();
    } finally {
      await sandbox.cleanup();
    }
  });

  test('should allow switching users', async ({ page, logout, loginAs }) => {
    // Already logged in as alice_dm (default from beforeEach)
    // First manually login as alice
    await loginAs(page, 'alice_dm');
    await page.goto('/groups');
    await expect(page.getByText('Brussels Adventurers Guild')).toBeVisible();

    // Logout and login as bob_boardgamer
    await logout(page);
    await loginAs(page, 'bob_boardgamer');

    await page.goto('/groups');
    await expect(page.getByText('Brussels Adventurers Guild')).toBeVisible();
  });
});
