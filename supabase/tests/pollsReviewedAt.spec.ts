import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const sql = readFileSync(
	resolve(
		process.cwd(),
		"supabase/migrations/20261006120000_polls_reviewed_at.sql"
	),
	"utf8"
);

const body = sql.replace(/^\s*--.*$/gm, "").replace(/\s+/g, " ");

describe("the polls-reviewed-at migration", () => {
	it("adds the reviewed stamp as a nullable column", () => {
		expect(body).toContain(
			'ADD COLUMN IF NOT EXISTS "reviewed_at" timestamp with time zone;'
		);
	});

	it("leaves every existing poll unreviewed", () => {
		expect(body).not.toContain("UPDATE");
	});
});
