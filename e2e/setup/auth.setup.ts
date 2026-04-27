import { test as setup, expect } from "@playwright/test";

setup("authenticate", async ({ page }) => {
	await page.goto("/login");
	await page.waitForLoadState("networkidle");

	await page.fill("#email", process.env.LOCAL_EMAIL ?? "");
	await page.fill("#password", process.env.LOCAL_PASS ?? "");
	await page.getByRole("button", { name: "Login" }).click();

	await page.screenshot({ path: "e2e/.auth/post-login.png", fullPage: true });

	const errorMessage = page.locator(".text-red-400");
	const navigated = page
		.waitForURL(/\/(start|daily-poll)/, { timeout: 15000 })
		.then(() => "navigated");
	const errored = errorMessage.waitFor({ timeout: 15000 }).then(async () => {
		const msg = await errorMessage.textContent();
		return `login-error: ${msg}`;
	});

	const result = await Promise.race([navigated, errored]);

	if (result !== "navigated") {
		throw new Error(`Login failed — ${result}`);
	}

	await expect(page).not.toHaveURL(/login/);
	await page.context().storageState({ path: "e2e/.auth/user.json" });
});
