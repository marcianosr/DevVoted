#!/usr/bin/env tsx
/**
 * Semantic release script.
 *
 * Reads the CHANGELOG.md [Unreleased] section and determines the version bump:
 *   - "added" or "removed" entries present → minor bump
 *   - only "changed", "fixed", "deprecated", "security" entries → patch bump
 *
 * Then:
 *   - Renames [Unreleased] to [x.y.z] - YYYY-MM-DD in CHANGELOG.md
 *   - Adds a fresh empty [Unreleased] section
 *   - Updates "version" in package.json
 *
 * Usage:
 *   npm run release            — bump and write files
 *   npm run release -- --dry-run — print what would happen, no writes
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Changelog, parser, Release } from "keep-a-changelog";

const isDryRun = process.argv.includes("--dry-run");

const scriptDir = dirname(fileURLToPath(import.meta.url));
const changelogPath = join(scriptDir, "../CHANGELOG.md");
const packagePath = join(scriptDir, "../package.json");

const changelog: Changelog = parser(readFileSync(changelogPath, "utf8"));
const pkg = JSON.parse(readFileSync(packagePath, "utf8")) as { version: string };

const unreleased = changelog.findRelease();

if (!unreleased) {
	console.error("No [Unreleased] section found in CHANGELOG.md");
	process.exit(1);
}

if (unreleased.isEmpty()) {
	console.log("Nothing in [Unreleased] — skipping release.");
	process.exit(0);
}

const counts = {
	added: unreleased.changes.get("added")?.length ?? 0,
	removed: unreleased.changes.get("removed")?.length ?? 0,
	changed: unreleased.changes.get("changed")?.length ?? 0,
	fixed: unreleased.changes.get("fixed")?.length ?? 0,
	deprecated: unreleased.changes.get("deprecated")?.length ?? 0,
	security: unreleased.changes.get("security")?.length ?? 0,
};

const isMinorBump = counts.added > 0 || counts.removed > 0;
const bumpType = isMinorBump ? "minor" : "patch";

const [major, minor, patch] = pkg.version.split(".").map(Number);
const newVersion = isMinorBump
	? `${major}.${minor + 1}.0`
	: `${major}.${minor}.${patch + 1}`;

const today = new Date().toISOString().slice(0, 10);

console.log(`Current version : ${pkg.version}`);
console.log(`Bump type       : ${bumpType} (added=${counts.added}, removed=${counts.removed})`);
console.log(`New version     : ${newVersion}`);
console.log(`Release date    : ${today}`);
console.log(
	`Changes         :`,
	Object.entries(counts)
		.filter(([, count]) => count > 0)
		.map(([category, count]) => `${category}=${count}`)
		.join(", "),
);

if (isDryRun) {
	console.log("\n--dry-run: no files written.");
	process.exit(0);
}

unreleased.setVersion(newVersion);
unreleased.setDate(new Date(today));

changelog.addRelease(new Release());

pkg.version = newVersion;
writeFileSync(changelogPath, changelog.toString());
writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);

console.log("\nDone. Commit CHANGELOG.md and package.json.");
