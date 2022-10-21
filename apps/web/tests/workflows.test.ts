import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
	// Click #navbarNav >> text=Workflows
	await page.locator('#navbarNav >> text=Workflows').click();
	await expect(page).toHaveURL('http://localhost:4173/workflows');

	// Click text=Configured Pipeline list
	await page.locator('text=Configured Pipeline list').click();

	// Click text=Manually Trigger workflow
	page.once('dialog', (dialog) => {
		console.log(`Dialog message: ${dialog.message()}`);
		dialog.dismiss().catch(() => {
			return;
		});
	});
	await page.locator('text=Manually Trigger workflow').click();
});
