import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const sql = readFileSync(
	resolve(
		process.cwd(),
		"supabase/migrations/20261005200000_dependency_grid.sql"
	),
	"utf8"
);

const body = sql.replace(/^\s*--.*$/gm, "").replace(/\s+/g, " ");

describe("the dependency-grid migration", () => {
	it("adds grid to the answer types without failing a second run", () => {
		expect(body).toContain(
			`ALTER TYPE "answer_type" ADD VALUE IF NOT EXISTS 'grid';`
		);
	});

	it("gives each option a nullable group index", () => {
		expect(body).toContain(
			'ALTER TABLE "polls_options" ADD COLUMN IF NOT EXISTS "group_index" smallint;'
		);
	});

	it("gives each poll nullable group labels", () => {
		expect(body).toContain(
			'ALTER TABLE "polls" ADD COLUMN IF NOT EXISTS "group_labels" text[];'
		);
	});
});
