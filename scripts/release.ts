#!/usr/bin/env tsx
/**
 * Turns CHANGELOG.md's [Unreleased] section into a dated release and bumps
 * package.json. The bump comes from release-decision.ts: minor when Added or
 * Removed entries exist, patch otherwise.
 *
 *   npm run release                       bump and write files
 *   npm run release -- --dry-run          print what would happen, write nothing
 *   npm run release -- --dry-run --json   one JSON line for CI:
 *                                         { willRelease, bumpType, newVersion, unreleased }
 *
 * Exits 1 when [Unreleased] holds bullets outside a ### category heading. The
 * parser reads those as description text and counts none of them, so the bump
 * would silently come out as patch.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parser, Release } from "keep-a-changelog";
import { z } from "zod";
import { decideRelease, findUnreleased } from "./release-decision";

const isDryRun = process.argv.includes("--dry-run");
const isJson = process.argv.includes("--json");

const scriptDir = dirname(fileURLToPath(import.meta.url));
const changelogPath = join(scriptDir, "../CHANGELOG.md");
const packagePath = join(scriptDir, "../package.json");

const changelog = parser(readFileSync(changelogPath, "utf8"));
const unreleased = findUnreleased(changelog);
const packageJson = z
	.looseObject({ version: z.string() })
	.parse(JSON.parse(readFileSync(packagePath, "utf8")));

const decision = decideRelease(unreleased, packageJson.version);

if (decision.kind === "uncategorised") {
	console.error(
		"CHANGELOG.md [Unreleased] has entries outside a ### category heading. They are not counted, so the bump would be wrong. Move them under ### Added, ### Changed, ### Removed or ### Fixed:\n"
	);
	const entries = decision.description
		.split("\n")
		.filter((line) => line.trim());
	console.error(entries.slice(0, 3).join("\n"));
	if (entries.length > 3) {
		console.error(`… and ${entries.length - 3} more.`);
	}
	process.exit(1);
}

if (decision.kind === "nothing-to-release") {
	console.log(
		isJson
			? JSON.stringify({ willRelease: false })
			: "Nothing in [Unreleased] — skipping release."
	);
	process.exit(0);
}

const { bumpType, newVersion, unreleased: unreleasedSection } = decision;
const today = new Date().toISOString().slice(0, 10);

const printJson = () =>
	console.log(
		JSON.stringify({
			willRelease: true,
			bumpType,
			newVersion,
			unreleased: unreleasedSection,
		})
	);

const printSummary = () => {
	console.log(`Current version : ${packageJson.version}`);
	console.log(`Bump type       : ${bumpType}`);
	console.log(`New version     : ${newVersion}`);
	console.log(`Release date    : ${today}`);
};

const print = isJson ? printJson : printSummary;
print();

if (isDryRun) {
	if (!isJson) {
		console.log("\n--dry-run: no files written.");
	}
	process.exit(0);
}

unreleased.setVersion(newVersion);
unreleased.setDate(new Date(today));
changelog.addRelease(new Release());

writeFileSync(changelogPath, changelog.toString());
writeFileSync(
	packagePath,
	`${JSON.stringify({ ...packageJson, version: newVersion }, null, "\t")}\n`
);

console.log("\nDone. Commit CHANGELOG.md and package.json.");
