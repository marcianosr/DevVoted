import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const sql = readFileSync(
	resolve(
		process.cwd(),
		"supabase/migrations/20261005120000_polls_author_announced_at.sql"
	),
	"utf8"
);

const body = sql.replace(/^\s*--.*$/gm, "").replace(/\s+/g, " ");

describe("the polls-author-announced-at migration", () => {
	it("adds the announced stamp as a nullable column", () => {
		expect(body).toContain(
			'ADD COLUMN IF NOT EXISTS "author_announced_at" timestamp with time zone;'
		);
	});

	it("stamps every poll already paid so none raises the dialog", () => {
		expect(body).toContain(
			'SET "author_announced_at" = "author_paid_at" WHERE "author_paid_at" IS NOT NULL'
		);
	});
});
