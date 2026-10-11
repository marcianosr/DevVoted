import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { TITLES } from "~/modules/account/profile/domain/title.model";

const sql = readFileSync(
	resolve(
		process.cwd(),
		"supabase/migrations/20260929160000_replace_special_titles.sql"
	),
	"utf8"
);

const body = sql.replace(/^\s*--.*$/gm, "");

const clearedIds = [
	...(body.match(/ARRAY\[([\s\S]*?)\];/)?.[1] ?? "").matchAll(/'([^']+)'/g),
].map((match) => match[1]);

const REUSED_IDS = ["title-ship-it", "title-stack-overflow"];

describe("the replace-special-titles migration", () => {
	it("clears the eight old special titles", () => {
		expect(clearedIds).toHaveLength(8);
	});

	it("clears six ids the roster no longer holds", () => {
		const rosterIds = new Set(TITLES.map((title) => title.id));

		expect(clearedIds.filter((id) => !rosterIds.has(id))).toHaveLength(6);
	});

	it("clears the two reused ids, so nobody holds a new title for the old requirement", () => {
		expect(clearedIds).toEqual(expect.arrayContaining(REUSED_IDS));
	});

	it("clears the worn array before deleting the rows it points at", () => {
		expect(body.indexOf(`UPDATE "users"`)).toBeGreaterThan(-1);
		expect(body.indexOf(`UPDATE "users"`)).toBeLessThan(
			body.indexOf(`DELETE FROM "user_titles"`)
		);
	});

	it("keeps the order of the titles still worn, since the first is the primary", () => {
		expect(body).toContain("WITH ORDINALITY");
		expect(body).toContain("ORDER BY position");
	});

	it("skips itself rather than failing when the table is not there yet", () => {
		expect(body).toContain("RAISE NOTICE");
		expect(body).toContain("RETURN;");
	});
});
