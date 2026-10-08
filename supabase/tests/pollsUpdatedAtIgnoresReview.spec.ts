import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const sql = readFileSync(
	resolve(
		process.cwd(),
		"supabase/migrations/20261007130000_polls_updated_at_ignores_review.sql"
	),
	"utf8"
);

const body = sql.replace(/^\s*--.*$/gm, "").replace(/\s+/g, " ");

describe("the polls-updated-at-ignores-review migration", () => {
	it("pulls the update stamp back to the review that bumped it", () => {
		expect(body).toContain('SET "updated_at" = "reviewed_at"');
	});

	it("touches only the polls whose update came within a second of their review", () => {
		expect(body).toContain(
			`"updated_at" - "reviewed_at" < interval '1 second'`
		);
		expect(body).toContain('"updated_at" >= "reviewed_at"');
	});

	it("leaves unreviewed polls alone", () => {
		expect(body).toContain('"reviewed_at" IS NOT NULL');
	});
});
