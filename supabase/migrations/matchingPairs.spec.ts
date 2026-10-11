import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const sql = readFileSync(
	resolve(
		process.cwd(),
		"supabase/migrations/20261011120000_matching_pairs.sql"
	),
	"utf8"
);

const body = sql.replace(/^\s*--.*$/gm, "").replace(/\s+/g, " ");

describe("the matching-pairs migration", () => {
	it("adds pairs to the answer types without failing a second run", () => {
		expect(body).toContain(
			`ALTER TYPE "answer_type" ADD VALUE IF NOT EXISTS 'pairs';`
		);
	});

	it("gives each option a nullable pair index", () => {
		expect(body).toContain(
			'ALTER TABLE "polls_options" ADD COLUMN IF NOT EXISTS "group_index" smallint;'
		);
	});
});
