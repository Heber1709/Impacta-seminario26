import { expect, test } from '@playwright/test';

test('login screen displays the Google sign-in entry point', async ({ page }) => {
  await page.goto('/login');

  await expect(
    page.getByRole('heading', { name: 'Bienvenido' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Acceder con Google/i }),
  ).toBeVisible();
  await expect(page.getByText('Gestión de donaciones')).toBeVisible();

  const widths = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(widths.body).toBeLessThanOrEqual(widths.viewport + 1);
});
