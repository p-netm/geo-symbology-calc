import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
	// Go to http://localhost:4173/
	await page.goto('http://localhost:4173/');

	// Click #navbarNav >> text=Create Config
	await page.locator('#navbarNav >> text=Create Config').click();
	await expect(page).toHaveURL('http://localhost:4173/');

	// Click #navbarNav >> text=Create Config
	await page.locator('#navbarNav >> text=Create Config').click();
	await expect(page).toHaveURL('http://localhost:4173/configs');

	// Click pre
	await page.locator('pre').click();

	// Click text=Create Symbology configs form
	await page.locator('text=Create Symbology configs form').click();

	// Click input[name="formPair\.regFormId"]
	await page.locator('input[name="formPair\\.regFormId"]').click();

	// Fill input[name="formPair\.regFormId"]
	await page.locator('input[name="formPair\\.regFormId"]').fill('01');

	// Click input[name="formPair\.visitFormId"]
	await page.locator('input[name="formPair\\.visitFormId"]').click();

	// Fill input[name="formPair\.visitFormId"]
	await page.locator('input[name="formPair\\.visitFormId"]').fill('02');

	// Click input[name="baseUrl"]
	await page.locator('input[name="baseUrl"]').click();

	// Fill input[name="baseUrl"]
	await page.locator('input[name="baseUrl"]').fill('https://stage-api.ona.io');

	// Click text=crontab
	const [page1] = await Promise.all([
		page.waitForEvent('popup'),
		page.locator('text=crontab').click()
	]);

	// Click input[name="cronExpression"]
	await page1.locator('input[name="cronExpression"]').click();

	// Triple click input[name="cronExpression"]
	await page1.locator('input[name="cronExpression"]').click({
		clickCount: 3
	});

	// Click input[name="schedule"]
	await page.locator('input[name="schedule"]').click();

	// Fill input[name="schedule"]
	await page.locator('input[name="schedule"]').fill('*/5 * * * *');

	// Click input[name="symbolConfig0\.frequency"]
	await page.locator('input[name="symbolConfig0\\.frequency"]').click();

	// Fill input[name="symbolConfig0\.frequency"]
	await page.locator('input[name="symbolConfig0\\.frequency"]').fill('3');

	// Click input[name="symbolConfig\[0\]\.symbologyOnOverflow\[0\]\.overFlowDays"]
	await page
		.locator('input[name="symbolConfig\\[0\\]\\.symbologyOnOverflow\\[0\\]\\.overFlowDays"]')
		.click();

	// Fill input[name="symbolConfig\[0\]\.symbologyOnOverflow\[0\]\.overFlowDays"]
	await page
		.locator('input[name="symbolConfig\\[0\\]\\.symbologyOnOverflow\\[0\\]\\.overFlowDays"]')
		.fill('1');

	// Click input[name="symbolConfig\[0\]\.symbologyOnOverflow\[0\]\.color"]
	await page
		.locator('input[name="symbolConfig\\[0\\]\\.symbologyOnOverflow\\[0\\]\\.color"]')
		.click();

	// Click input[name="symbolConfig\[0\]\.symbologyOnOverflow\[0\]\.color"]
	await page
		.locator('input[name="symbolConfig\\[0\\]\\.symbologyOnOverflow\\[0\\]\\.color"]')
		.click();

	// Fill input[name="symbolConfig\[0\]\.symbologyOnOverflow\[0\]\.color"]
	await page
		.locator('input[name="symbolConfig\\[0\\]\\.symbologyOnOverflow\\[0\\]\\.color"]')
		.fill('#1eff00');

	// Click #symbol-configs >> text=+
	await page.locator('#symbol-configs >> text=+').click();

	// Click input[name="symbolConfig\[0\]\.symbologyOnOverflow\[1\]\.overFlowDays"]
	await page
		.locator('input[name="symbolConfig\\[0\\]\\.symbologyOnOverflow\\[1\\]\\.overFlowDays"]')
		.click();

	// Fill input[name="symbolConfig\[0\]\.symbologyOnOverflow\[1\]\.overFlowDays"]
	await page
		.locator('input[name="symbolConfig\\[0\\]\\.symbologyOnOverflow\\[1\\]\\.overFlowDays"]')
		.fill('3');

	// Click input[name="symbolConfig\[0\]\.symbologyOnOverflow\[1\]\.color"]
	await page
		.locator('input[name="symbolConfig\\[0\\]\\.symbologyOnOverflow\\[1\\]\\.color"]')
		.click();

	// Fill input[name="symbolConfig\[0\]\.symbologyOnOverflow\[1\]\.color"]
	await page
		.locator('input[name="symbolConfig\\[0\\]\\.symbologyOnOverflow\\[1\\]\\.color"]')
		.fill('#fcdb03');

	// Click text=+ Add another priority level
	await page.locator('text=+ Add another priority level').click();

	// Select Medium
	await page.locator('select[name="symbolConfig1\\.priorityLevel"]').selectOption('Medium');

	// Click input[name="symbolConfig1\.frequency"]
	await page.locator('input[name="symbolConfig1\\.frequency"]').click();

	// Fill input[name="symbolConfig1\.frequency"]
	await page.locator('input[name="symbolConfig1\\.frequency"]').fill('2');

	// Click input[name="symbolConfig\[1\]\.symbologyOnOverflow\[0\]\.overFlowDays"]
	await page
		.locator('input[name="symbolConfig\\[1\\]\\.symbologyOnOverflow\\[0\\]\\.overFlowDays"]')
		.click();

	// Click div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > .col-sm-9
	await page.locator('div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > .col-sm-9').click();

	// Fill input[name="symbolConfig1\.frequency"]
	await page.locator('input[name="symbolConfig1\\.frequency"]').fill('10');

	// Click input[name="symbolConfig\[1\]\.symbologyOnOverflow\[0\]\.overFlowDays"]
	await page
		.locator('input[name="symbolConfig\\[1\\]\\.symbologyOnOverflow\\[0\\]\\.overFlowDays"]')
		.click();

	// Fill input[name="symbolConfig\[1\]\.symbologyOnOverflow\[0\]\.overFlowDays"]
	await page
		.locator('input[name="symbolConfig\\[1\\]\\.symbologyOnOverflow\\[0\\]\\.overFlowDays"]')
		.fill('0');

	// Click input[name="symbolConfig\[1\]\.symbologyOnOverflow\[0\]\.color"]
	await page
		.locator('input[name="symbolConfig\\[1\\]\\.symbologyOnOverflow\\[0\\]\\.color"]')
		.click();

	// Click text=Generate Json
	await page.locator('text=Generate Json').click();

	// Click text=Copy Config
	page.once('dialog', (dialog) => {
		console.log(`Dialog message: ${dialog.message()}`);
		dialog.dismiss().catch(() => {
			return;
		});
	});

	await page.locator('text=Copy Config').click();
});
