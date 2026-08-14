import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { execSync } from "child_process";

const getLastCommitDate = () => {
	try {
		return execSync("git log -1 --format=%cI").toString().trim();
	} catch {
		return new Date().toISOString();
	}
};

export default defineConfig(({ mode }) => ({
	server: {
		port: 3005,
		// Vite blocks requests whose Host isn't localhost (CVE-2025-24010 fix).
		// Allow Cloudflare quick tunnels so the dev app is reachable remotely
		// (`cloudflared tunnel --url http://localhost:3005`).
		allowedHosts: [".trycloudflare.com"],
	},
	define: {
		__LAST_COMMIT_DATE__: JSON.stringify(getLastCommitDate()),
	},
	resolve: {
		alias: [
			{ find: "~", replacement: resolve(__dirname, "./src") },
			{ find: "@/src", replacement: resolve(__dirname, "./src") },
		],
	},
	plugins: [
		tsConfigPaths(),
		tanstackStart(),
		...(mode !== "test" ? [nitro()] : []),
		react(),
		tailwindcss(),
	],
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
}));
