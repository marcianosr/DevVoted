import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

// Storybook would otherwise merge the root vite.config.ts, whose TanStack Start,
// Nitro and Sentry plugins boot the app server inside Storybook's process.
export default defineConfig({
	resolve: {
		alias: [{ find: "~", replacement: resolve(__dirname, "../src") }],
	},
	plugins: [react(), tailwindcss()],
});
