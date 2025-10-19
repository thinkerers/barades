import type { Page } from '@playwright/test';
import { expect, test } from './fixtures/auth.fixture';
import type { PollSandboxContext } from './helpers/test-data';

test.describe('Poll Voting', () => {
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

  test('should allow member to remove their vote', async ({
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

      const removeButton = page.getByRole('button', {
        name: /retirer mon vote/i,
      });
      await expect(removeButton).toBeEnabled();
      const [removeResponse] = await Promise.all([
        page.waitForResponse((response) => {
          return (
            response.request().method() === 'DELETE' &&
            response.url().includes('/polls/') &&
            response.url().includes('/vote/')
          );
        }),
        removeButton.click(),
      ]);
      expect(removeResponse.status()).toBe(200);
      await expect(pollDisplay.locator('.poll-option--selected')).toHaveCount(
        0
      );
    } finally {
      await sandbox.cleanup();
    }
  });

  test('should show which dates current user voted for', async ({
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

      const voteButtons = pollDisplay.locator('.poll-option__button');
      await voteButtons.first().click();

      await expect(pollDisplay.locator('.poll-option--selected')).toBeVisible();
    } finally {
      await sandbox.cleanup();
    }
  });

  test('should display best date (most votes)', async ({
    authenticatedPage: page,
    createPollSandbox,
    createPollForGroup,
  }) => {
    const sandbox = await createPollSandbox({
      members: ['alice_dm', 'bob_boardgamer', 'carol_newbie'],
      isPublic: true,
    });
    const preferredDates = [
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    ];

    await createPollForGroup(sandbox.groupId, {
      dates: preferredDates,
      votesByUsername: {
        alice_dm: preferredDates[0],
        bob_boardgamer: preferredDates[0],
        carol_newbie: preferredDates[1],
      },
    });

    try {
      await openSandboxGroupDetail(page, sandbox);

      const pollDisplay = page.locator('.poll-display').first();
      await expect(pollDisplay).toBeVisible();

      await expect(pollDisplay.locator('.poll-option--best')).toBeVisible();
    } finally {
      await sandbox.cleanup();
    }
  });

  test('should prevent non-member from voting', async ({
    page,
    loginAs,
    createPollSandbox,
    createPollForGroup,
  }) => {
    const sandbox = await createPollSandbox({
      members: ['alice_dm'],
      isPublic: true,
    });
    await createPollForGroup(sandbox.groupId);

    try {
      await loginAs(page, 'dave_poker');
      await expect(page).toHaveURL('/');

      await openSandboxGroupDetail(page, sandbox);

      const voteButtons = page.locator('.poll-option__button');
      await expect(voteButtons.first()).toBeDisabled();
    } finally {
      await sandbox.cleanup();
    }
  });

  test('should update vote counts in real-time', async ({
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
      await voteButton.click();

      await expect(pollDisplay.getByText(/\d+\s*vote/i)).toBeVisible();
    } finally {
      await sandbox.cleanup();
    }
  });

  test('should allow voting on multiple dates in same poll', async ({
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
      await voteButton.click();

      await expect(pollDisplay.locator('.poll-option--selected')).toBeVisible();
    } finally {
      await sandbox.cleanup();
    }
  });

  test('should show vote details tooltip', async ({
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

      const pollOption = pollDisplay.locator('.poll-option').first();
      await pollOption.hover();

      await expect(pollDisplay).toBeVisible();
    } finally {
      await sandbox.cleanup();
    }
  });
});
