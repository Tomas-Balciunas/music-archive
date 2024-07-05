import { test, expect } from '@playwright/test'

test('visitor can see the homepage heading', async ({ page }) => {
  await page.goto('/')

  const heading = page.getByRole('heading', { name: 'LIST OF BANDS', exact: true })

  await expect(heading).toBeVisible()
})