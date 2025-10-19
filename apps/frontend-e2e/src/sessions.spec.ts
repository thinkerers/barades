import { Dialog } from '@playwright/test';
import { expect, test } from './fixtures/auth.fixture';

test.describe('Sessions Management', () => {
  test('owner can delete a session they created', async ({
    page,
    loginAs,
    createSessionSandbox,
  }) => {
    const sandbox = await createSessionSandbox({ host: 'alice_dm' });

    await loginAs(page, 'alice_dm');
    await expect(page).toHaveURL('/');

    const dialogHandler = async (dialog: Dialog) => {
      await dialog.accept();
    };

    page.on('dialog', dialogHandler);

    try {
      await page.goto(`/sessions/${sandbox.sessionId}`);

      // Ensure session data is visible
      await expect(
        page.getByRole('heading', { name: sandbox.sessionTitle })
      ).toBeVisible();

      const deleteButton = page.getByRole('button', { name: 'Supprimer' });
      await expect(deleteButton).toBeVisible();
      await expect(deleteButton).toBeEnabled();

      await deleteButton.click();

      await page.waitForURL(/\/sessions(\?|$)/, { timeout: 15000 });
      await expect(page).toHaveURL(/filter=my-hosted/);
    } finally {
      page.off('dialog', dialogHandler);
    }

    const response = await page.request.get(
      `http://localhost:3000/api/sessions/${sandbox.sessionId}`,
      { failOnStatusCode: false }
    );
    expect(response.status()).toBe(404);
  });
});
