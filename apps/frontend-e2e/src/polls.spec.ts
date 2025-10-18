import type { Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { expect, test } from './fixtures/auth.fixture';

function uniqueTitle(base: string): string {
  return `${base} ${randomUUID().slice(0, 8)}`;
}

async function openGroupDetail(page: Page, groupName: string): Promise<void> {
  await page.goto('/groups');
  const groupCard = page.locator('.group-card', { hasText: groupName });
  await expect(groupCard).toBeVisible();
  await groupCard.getByRole('button', { name: 'Voir les détails' }).click();
  await expect(page.locator('.group-detail__title')).toContainText(groupName);
  await expect(page.getByTestId('poll-widget')).toBeVisible();
}

test.describe('Poll Creation and Management', () => {
  test('should allow alice_dm to create a poll in a dedicated sandbox group', async ({
    authenticatedPage: page,
    createPollSandbox,
  }, testInfo) => {
    const sandbox = await createPollSandbox({
      namePrefix: `Poll Creation ${testInfo.title}`,
      members: ['alice_dm'],
    });

    const pollTitle = uniqueTitle('Session Gloomhaven');

    await openGroupDetail(page, sandbox.groupName);
    await page.getByTestId('create-poll-button').click();
    await page.getByTestId('poll-title-input').fill(pollTitle);

    const addDate = async (value: string) => {
      await page.locator('#date-input').fill(value);
      await page.getByRole('button', { name: /ajouter/i }).click();
    };

    await addDate('2025-10-30T19:00');
    await addDate('2025-11-02T19:00');
    await addDate('2025-11-05T19:00');

    await page.getByRole('button', { name: /créer le sondage/i }).click();
    await expect(page.locator('.poll-display h3')).toHaveText(pollTitle);
  });

  test('should prevent bob_boardgamer from accessing private sandbox groups', async ({
    page,
    loginAs,
    createPollSandbox,
  }, testInfo) => {
    const sandbox = await createPollSandbox({
      namePrefix: `Private Poll Group ${testInfo.title}`,
      members: ['alice_dm'],
      isPublic: false,
      recruiting: false,
    });

    await loginAs(page, 'alice_dm');
    await openGroupDetail(page, sandbox.groupName);

    await loginAs(page, 'bob_boardgamer');
    await expect(page).toHaveURL('/');
    await page.goto('/groups');
    await expect(page.getByText(sandbox.groupName)).toBeHidden();
  });

  test('should show poll creation button only for group members', async ({
    authenticatedPage: page,
    loginAs,
    createPollSandbox,
  }, testInfo) => {
    const sandbox = await createPollSandbox({
      namePrefix: `Membership Sandbox ${testInfo.title}`,
      members: ['alice_dm'],
      isPublic: false,
      recruiting: false,
    });

    await openGroupDetail(page, sandbox.groupName);
    await expect(page.getByTestId('create-poll-button')).toBeVisible();

    await loginAs(page, 'dave_poker');
    await expect(page).toHaveURL('/');
    await page.goto('/groups');
    await expect(page.getByText(sandbox.groupName)).toBeHidden();
  });

  test('should display existing poll in seeded group', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/groups');
    const brusselsCard = page.locator('.group-card', {
      hasText: 'Brussels Adventurers Guild',
    });
    await brusselsCard
      .getByRole('button', { name: 'Voir les détails' })
      .click();
    await expect(page).toHaveURL(/\/groups\//);
    await expect(page.locator('.poll-widget')).toBeVisible();
    await expect(page.locator('.poll-display h3')).toContainText(/best date/i);
  });

  test('should show vote counts for poll dates', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/groups');
    const brusselsCard = page.locator('.group-card', {
      hasText: 'Brussels Adventurers Guild',
    });
    await brusselsCard
      .getByRole('button', { name: 'Voir les détails' })
      .click();
    const pollSection = page.locator('.poll-display').first();
    await expect(pollSection).toBeVisible();
    await expect(pollSection.locator('.poll-display__stats')).toContainText(
      /vote/i
    );
  });

  test('should validate poll form fields in sandbox group', async ({
    authenticatedPage: page,
    createPollSandbox,
  }, testInfo) => {
    const sandbox = await createPollSandbox({
      namePrefix: `Validation Sandbox ${testInfo.title}`,
      members: ['alice_dm'],
    });

    await openGroupDetail(page, sandbox.groupName);
    await page.getByTestId('create-poll-button').click();

    const submitButton = page.getByRole('button', {
      name: /créer le sondage/i,
    });
    await expect(submitButton).toBeDisabled();

    await page.getByTestId('poll-title-input').fill('Test Poll');
    await expect(submitButton).toBeDisabled();

    await page.locator('#date-input').fill('2025-11-10T19:00');
    await page.getByRole('button', { name: /ajouter/i }).click();
    await expect(submitButton).toBeDisabled();

    await page.locator('#date-input').fill('2025-11-11T19:00');
    await page.getByRole('button', { name: /ajouter/i }).click();
    await expect(submitButton).toBeEnabled();
  });

  test('should allow member to create multiple polls in same group', async ({
    authenticatedPage: page,
    createPollSandbox,
  }, testInfo) => {
    test.fixme(true, 'Multiple concurrent polls per group not supported yet.');

    const sandbox = await createPollSandbox({
      namePrefix: `Multiple Polls ${testInfo.title}`,
      members: ['alice_dm'],
    });

    await openGroupDetail(page, sandbox.groupName);
    await page.getByTestId('create-poll-button').click();
    await page
      .getByTestId('poll-title-input')
      .fill(uniqueTitle('Session Twilight Imperium'));
    await page.locator('#date-input').fill('2025-11-10T19:00');
    await page.getByRole('button', { name: /ajouter/i }).click();
    await page.locator('#date-input').fill('2025-11-11T19:00');
    await page.getByRole('button', { name: /ajouter/i }).click();
    await page.getByRole('button', { name: /créer le sondage/i }).click();
    await expect(page.getByTestId('poll-display')).toBeVisible();
  });
});
