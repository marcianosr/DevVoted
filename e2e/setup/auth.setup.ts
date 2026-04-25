import { test as setup, expect } from "@playwright/test";

setup("authenticate", async ({ page }) => {
	await page.goto("/login");
	await page.waitForLoadState("networkidle");

	await page.fill("#email", process.env.LOCAL_EMAIL ?? "");
	await page.fill("#password", process.env.LOCAL_PASS ?? "");
	await page.getByRole("button", { name: "Login" }).click();

	await page.screenshot({ path: "e2e/.auth/post-login.png", fullPage: true });

	await page.waitForURL(/\/(start|daily-poll)/, { timeout: 30000 });
	await expect(page).not.toHaveURL(/login/);

	await page.context().storageState({ path: "e2e/.auth/user.json" });
});
