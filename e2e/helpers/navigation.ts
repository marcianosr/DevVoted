import type { Page } from "@playwright/test";

export const ensureActiveRun = async (page: Page): Promise<void> => {
	await page.goto("/daily-poll");

	if (page.url().includes("/start")) {
		await page.getByRole("button", { name: "Start New Run" }).click();
		await page.waitForURL("**/daily-poll**");
	}
};

export const resetDailyPoll = async (page: Page): Promise<void> => {
	await page.goto("/e2e-reset");
	await page.waitForURL("**/daily-poll**");
};
