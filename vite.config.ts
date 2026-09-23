import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
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

const getCommitSha = () => {
	try {
		return execSync("git rev-parse HEAD").toString().trim();
	} catch {
		return "local";
	}
};

// Vercel's checkout can be shallow, so prefer the value it hands the build.
const COMMIT_SHA = process.env.VERCEL_GIT_COMMIT_SHA ?? getCommitSha();
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;

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
		// VERCEL_* vars carry no VITE_ prefix, so import.meta.env cannot see them.
		// Widening envPrefix would ship every VERCEL_* var — including the
		// automation bypass secret — into the browser, so bridge just these two.
		__COMMIT_SHA__: JSON.stringify(COMMIT_SHA),
		__DEPLOY_ENVIRONMENT__: JSON.stringify(process.env.VERCEL_ENV ?? mode),
	},
	resolve: {
		alias: [
			{ find: "~", replacement: resolve(__dirname, "./src") },
			{ find: "@/src", replacement: resolve(__dirname, "./src") },
		],
	},
	plugins: [
		tanstackStart(),
		...(mode !== "test" ? [nitro()] : []),
		react(),
		tailwindcss(),
		...(mode === "test"
			? []
			: [
					sentryTanstackStart({
						org: process.env.SENTRY_ORG,
						project: process.env.SENTRY_PROJECT,
						authToken: SENTRY_AUTH_TOKEN,
						telemetry: false,
						// PR builds run `vite build` with no Sentry secrets, and
						// generating maps we cannot upload only slows them down.
						sourcemaps: { disable: SENTRY_AUTH_TOKEN === undefined },
						// Must match the `release` passed to Sentry.init, or uploaded
						// sourcemaps never attach to the events they belong to.
						release: { name: COMMIT_SHA },
					}),
				]),
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
