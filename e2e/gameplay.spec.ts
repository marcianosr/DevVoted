import { test, expect } from "@playwright/test";

import { ensureActiveRun, resetDailyPoll } from "./helpers/navigation";

test.describe("gameplay", () => {
	test.beforeEach(async ({ page }) => {
		await ensureActiveRun(page);
	});

	test("answers today's poll and shows the result", async ({ page }) => {
		await resetDailyPoll(page);

		// Wait for poll options to be rendered (id="option-{id}")
		const firstOption = page.locator("label[for^='option-']").first();
		await expect(firstOption).toBeVisible();
		await firstOption.click();

		await page.getByRole("button", { name: /submit answers/i }).click();

		// Button transitions to "Submitted!" once the answer is recorded
		await expect(page.getByRole("button", { name: /submitted/i })).toBeVisible({
			timeout: 10000,
		});
	});

	test("selects a pipeline upgrade card when one is available", async ({
		page,
	}) => {
		const upgradeHeading = page.getByText(/pipeline check passed/i);
		const hasUpgrade = await upgradeHeading.isVisible();

		if (!hasUpgrade) {
			test.skip(true, "No pipeline upgrade available in current game state");
			return;
		}

		const selectButton = page.getByRole("button", { name: "Select" }).first();
		await expect(selectButton).toBeVisible();
		await selectButton.click();

		await expect(upgradeHeading).not.toBeVisible();
	});

	test("visits the shop on the progress page", async ({ page }) => {
		await page.goto("/progress");

		await expect(
			page.getByRole("heading", { name: /config manager shop/i })
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: /skip shop/i })
		).toBeVisible();
	});

	test("rebuilds shop offers when storage allows", async ({ page }) => {
		await page.goto("/progress");

		const rebuildButton = page.getByRole("button", {
			name: /rebuild package offers/i,
		});
		const isEnabled = await rebuildButton.isEnabled();

		if (!isEnabled) {
			test.skip(true, "Insufficient storage to rebuild shop offers");
			return;
		}

		await rebuildButton.click();
		await expect(
			page.getByRole("button", { name: /rebuilding package offers/i })
		).toBeVisible();
		await expect(rebuildButton).toBeEnabled({ timeout: 5000 });
	});
});
