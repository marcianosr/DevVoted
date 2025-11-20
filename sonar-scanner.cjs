#!/usr/bin/env node

require("dotenv").config({ path: ".env" });
const sonarqubeScanner = require("sonarqube-scanner").default;

const path = require("path");

const serverUrl = process.env.SONAR_HOST_URL || "http://localhost:9001";
const token = process.env.SONAR_TOKEN || "";

if (!token && serverUrl.includes("localhost")) {
	console.log("🔍 Running SonarQube scan locally without token...");
} else if (!token) {
	console.error(
		"❌ SONAR_TOKEN environment variable is required for remote analysis"
	);
	process.exit(1);
}

const projectRoot = path.resolve(__dirname);
const coveragePath = path.join(projectRoot, "coverage", "lcov.info");

console.log("📊 Starting SonarQube analysis...");
console.log(`🎯 Project: devvoted-tanstack`);
console.log(`🌐 Server: ${serverUrl}`);
console.log(`📁 Source: ${path.join(projectRoot, "src")}`);

sonarqubeScanner(
	{
		serverUrl,
		token,
		options: {
			"sonar.projectKey": "devvoted-tanstack",
			"sonar.projectName": "DevVoted - Developer Quiz Game",
			"sonar.projectVersion": "1.0.0",
			"sonar.sources": "./src",
			"sonar.tests": "./src",
			"sonar.test.inclusions":
				"**/*.spec.ts,**/*.spec.tsx,**/*.test.ts,**/*.test.tsx",
			"sonar.exclusions": [
				"**/node_modules/**",
				"**/coverage/**",
				"**/.scannerwork/**",
				"src/routeTree.gen.ts",
				"src/test/setup.ts",
				"src/test/utils.tsx",
				"**/*.config.*",
				"**/*.d.ts",
			].join(","),
			"sonar.test.exclusions": [
				"src/test/setup.ts",
				"src/test/utils.tsx",
				"src/test/createMockDataFactory.ts",
			].join(","),
			"sonar.typescript.lcov.reportPaths": coveragePath,
			"sonar.sourceEncoding": "UTF-8",
			"sonar.javascript.node.maxspace": 4096,
			"sonar.qualitygate.wait": false,
		},
	},
	(error) => {
		if (error) {
			console.error("❌ SonarQube analysis failed:", error);
			process.exit(1);
		}
		console.log("✅ SonarQube analysis completed successfully!");
		console.log(
			`🔗 View results at: ${serverUrl}/dashboard?id=devvoted-tanstack`
		);
	}
);
