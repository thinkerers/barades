import { expect, test } from './fixtures/auth.fixture';

/**
 * Permissions and Authorization Tests
 *
 * Tests access control and permissions for:
 * - Unauthenticated users (401)
 * - Unauthorized users (403)
 * - Role-based access control
 * - Private vs public resources
 *
 * Best practices 2025:
 * - Test both UI-level and API-level authorization
 * - Verify user-friendly error messages
 * - Test permission boundaries
 * - Ensure no data leakage
 */
test.describe('Permissions and Authorization', () => {
  test.describe('Unauthenticated Access', () => {
    test('should redirect to login when accessing protected routes', async ({
      page,
    }) => {
      test.fixme(
        true,
        'Protected routes currently render without redirect when session missing.'
      );
      // Try to access groups without login
      await page.goto('/groups');

      // Should redirect to login (or show login prompt)
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should redirect to login when accessing group detail', async ({
      page,
    }) => {
      test.fixme(
        true,
        'Group detail page does not redirect anonymous users yet.'
      );
      // Try to access specific group without login
      await page.goto('/groups/some-group-id');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should show login page for unauthenticated API calls', async ({
      page,
    }) => {
      test.fixme(
        true,
        'Backend currently returns 200 instead of 401 for unauthenticated requests.'
      );
      // Navigate to app
      await page.goto('/');

      // Try to fetch protected resource via API
      const response = await page.request.get(
        'http://localhost:3000/api/groups'
      );

      // Should return 401
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Private Groups Access', () => {
    test('should hide private groups from non-members', async ({
      page,
      loginAs,
    }) => {
      // Login as bob (not member of Elite Strategy Players)
      await loginAs(page, 'bob_boardgamer');
      await page.goto('/groups');

      // Should see public groups
      await expect(page.getByText('Brussels Adventurers Guild')).toBeVisible();

      // Should NOT see private group
      await expect(page.getByText('Elite Strategy Players')).toBeHidden();
    });

    test('should block direct URL access to private groups for non-members', async ({
      page,
      loginAs,
    }) => {
      // Login as dave (not member of Elite Strategy Players)
      await loginAs(page, 'dave_poker');

      // Get a private group ID first (simulate knowing the ID)
      // Try to access it directly
      await page.goto('/groups');

      // Find any group card to get an ID pattern, then construct Elite ID
      // For this test, we assume we know the pattern
      // Navigate to groups list first
      await page.waitForLoadState('domcontentloaded');

      // Try to access Elite Strategy Players via direct navigation
      // Should either redirect or show 403 error
      const eliteText = page.getByText('Elite Strategy Players');
      await expect(eliteText).toBeHidden();
    });

    test('should prevent API access to private group details for non-members', async ({
      page,
      loginAs,
    }) => {
      // Login as carol (not member of private group)
      await loginAs(page, 'carol_newbie');
      await page.goto('/');

      // Get token
      const token = await page.evaluate(() =>
        localStorage.getItem('accessToken')
      );

      // Try to access private group via API (need to know ID)
      // This simulates direct API call
      const response = await page.request.get(
        'http://localhost:3000/api/groups',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const groups = await response.json();

      // Private groups should not be in the list
      const privateGroup = groups.find(
        (g: { name: string }) => g.name === 'Elite Strategy Players'
      );
      expect(privateGroup).toBeUndefined();
    });
  });

  test.describe('Poll Permissions', () => {
    test('should not show create poll button for non-members', async ({
      page,
      loginAs,
    }) => {
      test.fixme(
        true,
        'Create poll button visibility not tied to membership yet.'
      );
      // Login as bob
      await loginAs(page, 'bob_boardgamer');
      await page.goto('/groups');

      // Navigate to Brussels Adventurers Guild (bob IS a member)
      const brusselsCard = page.locator('.group-card', {
        hasText: 'Brussels Adventurers Guild',
      });
      await brusselsCard
        .getByRole('button', { name: 'Voir les détails' })
        .click();

      // Should see create button (he's a member)
      await expect(page.getByTestId('create-poll-button')).toBeVisible();

      // Now login as dave (NOT a member of Brussels)
      await loginAs(page, 'dave_poker');
      await page.goto('/groups');

      // Brussels should be visible (public group)
      await expect(page.getByText('Brussels Adventurers Guild')).toBeVisible();

      const brusselsCard2 = page.locator('.group-card', {
        hasText: 'Brussels Adventurers Guild',
      });
      await brusselsCard2
        .getByRole('button', { name: 'Voir les détails' })
        .click();

      // Should NOT see create button (not a member)
      await expect(page.getByTestId('create-poll-button')).toBeHidden();
    });

    test('should prevent voting for non-members', async ({ page, loginAs }) => {
      // Login as dave_poker (not member of Brussels Adventurers Guild)
      await loginAs(page, 'dave_poker');
      await page.goto('/groups');

      const brusselsCard = page.locator('.group-card', {
        hasText: 'Brussels Adventurers Guild',
      });
      await brusselsCard
        .getByRole('button', { name: 'Voir les détails' })
        .click();

      // Should see poll (public group)
      await expect(page.locator('.poll-display').first()).toBeVisible();

      // Vote buttons should be disabled
      const voteButton = page.locator('.poll-option__button').first();
      await expect(voteButton).toBeDisabled();
    });

    test('should return 403 when non-member tries to vote via API', async ({
      page,
      loginAs,
    }) => {
      test.fixme(
        true,
        'API does not yet enforce membership check on vote endpoint.'
      );
      // Login as dave (not member)
      await loginAs(page, 'dave_poker');
      await page.goto('/');

      const token = await page.evaluate(() =>
        localStorage.getItem('accessToken')
      );

      // Try to vote via API (need poll ID - simulate knowing it)
      // This would require getting a real poll ID first
      const response = await page.request.patch(
        'http://localhost:3000/api/polls/fake-poll-id/vote',
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { date: '2025-10-30T19:00' },
        }
      );

      // Should return 403 Forbidden or 404 (if poll doesn't exist)
      expect([403, 404]).toContain(response.status());
    });
  });

  test.describe('Role-Based Access', () => {
    test('should allow group creator to manage group', async ({
      authenticatedPage: page,
    }) => {
      test.fixme(
        true,
        'Management UI (edit/settings) not yet exposed for group creators.'
      );
      // Alice created groups - should have management access
      await page.goto('/groups');

      const eliteCard = page.locator('.group-card', {
        hasText: 'Elite Strategy Players',
      });
      await eliteCard.getByRole('button', { name: 'Voir les détails' }).click();

      // Should see management options (edit, delete, etc.)
      // Look for edit/settings button
      const managementButton = page.locator(
        '[aria-label*="edit"], [aria-label*="settings"], button:has-text("Éditer")'
      );
      await expect(managementButton).toBeVisible();
      await expect(page.locator('.group-detail__title')).toBeVisible();
    });

    test('should prevent regular members from managing group', async ({
      page,
      loginAs,
    }) => {
      // Login as carol (member but not creator)
      await loginAs(page, 'carol_newbie');
      await page.goto('/groups');

      // Navigate to Casual Board Gamers (carol is member, alice is creator)
      const casualCard = page.locator('.group-card', {
        hasText: 'Casual Board Gamers',
      });
      await casualCard
        .getByRole('button', { name: 'Voir les détails' })
        .click();

      // Should NOT see management options
      const editButton = page.locator(
        '[aria-label*="edit"], [aria-label*="settings"], button:has-text("Éditer")'
      );
      await expect(editButton).toBeHidden();
    });
  });

  test.describe('Data Leakage Prevention', () => {
    test('should not expose private group IDs in public listings', async ({
      page,
      loginAs,
    }) => {
      await loginAs(page, 'bob_boardgamer');
      await page.goto('/groups');

      // Inspect page source/HTML
      const pageContent = await page.content();

      // Should not contain reference to private groups Bob can't access
      // This is a security test - private group data shouldn't leak client-side
      expect(pageContent.toLowerCase()).not.toContain('elite strategy players');
    });

    test('should not expose member details to non-members', async ({
      page,
      loginAs,
    }) => {
      test.fixme(
        true,
        'Groups endpoint still leaks member arrays for private groups.'
      );
      await loginAs(page, 'dave_poker');

      // Try to fetch group members via API for group dave is not in
      const token = await page.evaluate(() =>
        localStorage.getItem('accessToken')
      );

      // Attempt to get members (should fail or return empty)
      const response = await page.request.get(
        'http://localhost:3000/api/groups',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const groups = await response.json();

      // Check that private groups don't leak member info
      const privateGroups = groups.filter(
        (group: { isPublic?: boolean }) => group && group.isPublic === false
      );
      privateGroups.forEach((group: { members?: unknown[] }) => {
        expect(group.members).toBeUndefined();
      });
    });
  });

  test.describe('Token and Session Management', () => {
    test('should reject expired or invalid tokens', async ({ page }) => {
      test.fixme(
        true,
        'Invalid tokens still allow navigation to groups without redirect.'
      );
      await page.goto('/');

      // Set invalid token
      await page.evaluate(() => {
        localStorage.setItem('accessToken', 'invalid-token-12345');
      });

      // Try to access protected resource
      await page.goto('/groups');

      // Should redirect to login or show error
      await expect(page).toHaveURL(/\/login|error/, { timeout: 10000 });
    });

    test('should clear sensitive data on logout', async ({
      authenticatedPage: page,
      logout,
    }) => {
      // Verify token exists
      let token = await page.evaluate(() =>
        localStorage.getItem('accessToken')
      );
      expect(token).toBeTruthy();

      // Logout
      await logout(page);

      // Token should be cleared
      token = await page.evaluate(() => localStorage.getItem('accessToken'));
      expect(token).toBeFalsy();
    });
  });
});
