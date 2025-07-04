import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";

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
	plugins: [tsConfigPaths(), tanstackStart()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./src/test/setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"src/test/",
				"**/*.d.ts",
				"**/*.config.*",
				"src/routeTree.gen.ts",
			],
		},
	},
});
