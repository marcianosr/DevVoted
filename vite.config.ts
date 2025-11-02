import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";

export default defineConfig({
	server: {
		port: 3005,
	},
	resolve: {
		alias: [
			{ find: "~", replacement: resolve(__dirname, "./src") },
			{ find: "@/src", replacement: resolve(__dirname, "./src") },
		],
	},
	plugins: [tsConfigPaths(), tanstackStart(), nitro(), react(), tailwindcss()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./src/test/setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html", "lcov"],
			reportsDirectory: "./coverage",
			exclude: [
				"node_modules/",
				"src/test/",
				"**/*.d.ts",
				"**/*.config.*",
				"src/routeTree.gen.ts",
				"**/.scannerwork/**",
			],
		},
		outputFile: {
			json: "./test-results.json",
		},
	},
});
