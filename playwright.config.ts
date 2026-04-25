import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: false, // gameplay tests mutate shared run state
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: 1,
	reporter: "html",
	use: {
		baseURL: "http://localhost:3005",
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "setup",
			testMatch: "**/setup/*.setup.ts",
		},
		{
			name: "gameplay",
			use: {
				...devices["Desktop Chrome"],
				storageState: "e2e/.auth/user.json",
			},
			dependencies: ["setup"],
		},
	],
	webServer: {
		command: "npm run dev",
		url: "http://localhost:3005",
		reuseExistingServer: true,
	},
});
