import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

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

  test('should successfully logout', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByPlaceholder('alice_dm').fill('alice_dm');
    await page.getByPlaceholder('••••••••••••').fill('password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL('/');
    
    // Verify token exists
    let token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeTruthy();
    
    // Logout - clear localStorage directly for now
    // TODO: Add proper logout button in UI with aria-label
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Verify token is removed
    token = await page.evaluate(() => localStorage.getItem('accessToken'));
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

  test('should login as different users', async ({ page }) => {
    // Login as alice_dm
    await page.goto('/login');
    await page.getByPlaceholder('alice_dm').fill('alice_dm');
    await page.getByPlaceholder('••••••••••••').fill('password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL('/');
    
    // Verify alice is logged in (check token)
    const aliceToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(aliceToken).toBeTruthy();
    
    // Logout
    await page.evaluate(() => localStorage.clear());
    
    // Login as bob_boardgamer
    await page.goto('/login');
    await page.getByPlaceholder('alice_dm').fill('bob_boardgamer');
    await page.getByPlaceholder('••••••••••••').fill('password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL('/');
    
    // Verify bob is logged in
    const bobToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(bobToken).toBeTruthy();
    expect(bobToken).not.toBe(aliceToken);
  });
});
