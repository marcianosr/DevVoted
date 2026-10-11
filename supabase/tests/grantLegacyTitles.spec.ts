import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * A migration cannot be unit tested — no spec ever reaches Postgres — but its
 * orderings can be. Each one below is a bug that succeeds silently: the grant
 * lands, the migration reports success, and a player is quietly never told or
 * never granted. Reading the file off disk is the only guard available.
 */
const sql = readFileSync(
	resolve(
		process.cwd(),
		"supabase/migrations/20260924130000_grant_legacy_titles.sql"
	),
	"utf8"
);

const at = (needle: string): number => {
	const index = sql.indexOf(needle);
	if (index === -1) throw new Error(`migration no longer contains: ${needle}`);
	return index;
};

const BACKFILL = 'SET "announced_at" = "earned_at"';
const GRANT_TESTER = "'title-legacy-tester', false";
const GRANT_ACTIVE = "'title-legacy-active', false";
const CLOSE_RUNS = `SET "status" = 'finished'`;

describe("the legacy grant migration", () => {
	it("stamps the old titles as seen before granting the new ones", () => {
		expect(at(BACKFILL)).toBeLessThan(at(GRANT_TESTER));
		expect(at(BACKFILL)).toBeLessThan(at(GRANT_ACTIVE));
	});

	it("leaves the two legacy titles out of that backfill, so a re-run cannot bury them", () => {
		const exclusion = sql.slice(at(BACKFILL), at(GRANT_TESTER));

		expect(exclusion).toContain("'title-legacy-tester'");
		expect(exclusion).toContain("'title-legacy-active'");
	});

	it("grants the mid-climb title before closing the runs that qualify for it", () => {
		expect(at(GRANT_ACTIVE)).toBeLessThan(at(CLOSE_RUNS));
	});

	it("marks neither granted title exclusive, which would hand it to one account", () => {
		expect(sql).not.toMatch(/'title-legacy-(tester|active)',\s*true/);
	});

	it("de-duplicates the cohort, because a calendar player has many runs", () => {
		expect(sql.match(/SELECT DISTINCT/g)).toHaveLength(2);
	});

	it("only auto-equips an account wearing nothing", () => {
		expect(sql).toContain(`WHERE u."equipped_title_id" IS NULL`);
	});
});
