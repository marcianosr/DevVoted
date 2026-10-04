import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const sql = readFileSync(
	resolve(
		process.cwd(),
		"supabase/migrations/20260928120000_backfill_category_answered.sql"
	),
	"utf8"
);

const body = sql.replace(/^\s*--.*$/gm, "");

describe("the category-answered backfill migration", () => {
	it("counts only session answers, the mode the metric's emitter runs in", () => {
		expect(body).toContain(`r."mode" = 'session'`);
	});

	it("leaves mirrored answers in, because the emitter counts them too", () => {
		expect(body).not.toMatch(/mirrored/i);
	});

	it("never overwrites a counter that has been incrementing since the metric shipped", () => {
		expect(body).toContain("ON CONFLICT");
		expect(body).toContain("DO NOTHING");
		expect(body).not.toMatch(/DO UPDATE/i);
	});

	it("joins the poll for the category, which the response row does not carry", () => {
		expect(body).toContain(`JOIN "polls" p`);
		expect(body).toContain(`p."category_code"`);
	});

	it("writes the metric under the name the title roster reads", () => {
		expect(body).toContain(`'category-answered:'`);
	});

	it("skips itself rather than failing when the table is not there yet", () => {
		expect(body).toContain("RAISE NOTICE");
		expect(body).toContain(`tablename = 'user_objective_progress'`);
	});

	it("drops answers whose account is gone, which the response keeps as null", () => {
		expect(body).toContain(`r."user_id" IS NOT NULL`);
	});
});
