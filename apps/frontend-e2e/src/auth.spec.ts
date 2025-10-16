import { test, expect } from './fixtures/auth.fixture';

test.describe('Authentication', () => {
  test('should display login page with form elements', async ({ page }) => {
    await page.goto('/login');
    
    // Check that login form is visible (Material UI uses mat-card-title, not heading)
    await expect(page.getByText('Connexion')).toBeVisible();
    await expect(page.getByPlaceholder('alice_dm')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••••••')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in login form
    await page.getByPlaceholder('alice_dm').fill('alice_dm');
    await page.getByPlaceholder('••••••••••••').fill('password123');
    
    // Submit form
    await page.getByRole('button', { name: 'Se connecter' }).click();
    
    // Wait for redirect to home page
    await expect(page).toHaveURL('/');
    
    // Check that token is stored in localStorage
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeTruthy();
  });

  test('should show error message with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in login form with wrong password
    await page.getByPlaceholder('alice_dm').fill('alice_dm');
    await page.getByPlaceholder('••••••••••••').fill('wrongpassword');
    
    // Submit form
    await page.getByRole('button', { name: 'Se connecter' }).click();
    
    // Wait for error message
    await expect(page.getByText(/incorrect|failed/i)).toBeVisible();
    
    // Should still be on login page
    await expect(page).toHaveURL('/login');
  });

  test('should successfully logout', async ({ authenticatedPage, logout }) => {
    // Verify user is logged in
    let token = await authenticatedPage.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeTruthy();
    
    // Logout using fixture helper
    await logout(authenticatedPage);
    
    // Verify token is removed
    token = await authenticatedPage.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeFalsy();
  });

  // TODO: Re-enable these tests once auth guards are configured in app.routes.ts
  // test('should redirect to login when accessing protected route without auth', async ({ page }) => {
  //   await page.goto('/groups/some-group-id');
  //   await expect(page).toHaveURL(/\/login/);
  // });

  // test('should redirect to returnUrl after login', async ({ page }) => {
  //   await page.goto('/groups');
  //   await expect(page).toHaveURL(/\/login/);
  //   await page.getByPlaceholder('alice_dm').fill('alice_dm');
  //   await page.getByPlaceholder('••••••••••••').fill('password123');
  //   await page.getByRole('button', { name: 'Se connecter' }).click();
  //   await expect(page).toHaveURL('/groups');
  // });

  test('should login as different users', async ({ page, loginAs }) => {
    // Login as alice_dm
    await loginAs(page, 'alice_dm');
    await expect(page).toHaveURL('/');
    
    // Verify alice is logged in (check token)
    const aliceToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(aliceToken).toBeTruthy();
    
    // Logout and login as bob_boardgamer
    await page.evaluate(() => localStorage.clear());
    await loginAs(page, 'bob_boardgamer');
    await expect(page).toHaveURL('/');
    
    // Verify bob is logged in with different token
    const bobToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(bobToken).toBeTruthy();
    expect(bobToken).not.toBe(aliceToken);
  });
});
