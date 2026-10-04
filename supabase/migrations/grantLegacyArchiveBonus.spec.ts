import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * A migration cannot be unit tested — no spec ever reaches Postgres — but the
 * shapes that make it wrong can be. Each one below pays the wrong account the
 * wrong amount and still reports success. Reading the file off disk is the only
 * guard available.
 */
const sql = readFileSync(
	resolve(
		process.cwd(),
		"supabase/migrations/20260925120000_grant_legacy_archive_bonus.sql"
	),
	"utf8"
);

/** The statements alone: the comments name the traps and would match them. */
const body = sql.replace(/^\s*--.*$/gm, "");

const at = (needle: string): number => {
	const index = sql.indexOf(needle);
	if (index === -1) throw new Error(`migration no longer contains: ${needle}`);
	return index;
};

const ADD_COLUMN = 'ADD COLUMN IF NOT EXISTS "legacy_bonus_bytes"';
const COHORT_SOURCE = 'FROM "user_titles" ut';
const CREDIT = 'SET "archived_storage" = u."archived_storage" + c."bytes"';
const MARKER = '"legacy_bonus_bytes" = c."bytes"';
const GUARD = 'AND u."legacy_bonus_bytes" IS NULL';

describe("the legacy archive bonus migration", () => {
	it("reads the cohort from the title ledger, which outlives the runs it was derived from", () => {
		expect(sql).toContain(COHORT_SOURCE);
	});

	it("never re-derives the cohort from runs, which ADR-111 closes before this file runs", () => {
		expect(body).not.toContain('"runs"');
		expect(body).not.toContain("'calendar'");
	});

	it("collapses an account holding both titles to the larger payment instead of stacking", () => {
		expect(body).toContain("bool_or");
		expect(body).not.toMatch(/sum\s*\(/i);
	});

	it("pays the mid-climb tier more than the tier it is a subset of", () => {
		expect(sql).toContain("1024 * 1024");
		expect(sql).toContain("256 * 1024");
	});

	it("credits the balance and stamps the marker in one statement, so neither can land alone", () => {
		expect(sql.match(/UPDATE "users"/g)).toHaveLength(1);
		expect(at(CREDIT)).toBeLessThan(at(MARKER));
	});

	it("skips an account already paid, so re-applying pays nobody twice", () => {
		expect(sql).toContain(GUARD);
	});

	it("adds the marker column before the statement that reads it", () => {
		expect(at(ADD_COLUMN)).toBeLessThan(at(GUARD));
	});
});
