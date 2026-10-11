import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { TITLES } from "~/modules/account/profile/domain/title.model";

const sql = readFileSync(
	resolve(
		process.cwd(),
		"supabase/migrations/20260929120000_retire_titles_and_grant_poll_count_rungs.sql"
	),
	"utf8"
);

const body = sql.replace(/^\s*--.*$/gm, "");

const retiredIds = [
	...(body.match(/ARRAY\[([\s\S]*?)\];/)?.[1] ?? "").matchAll(/'([^']+)'/g),
].map((match) => match[1]);

const grantedRungs = [...body.matchAll(/\('(title-rank-[^']+)', (\d+)\)/g)].map(
	(match) => ({ id: match[1], target: Number(match[2]) })
);

const pollCountRungs = TITLES.flatMap((title) =>
	title.earn.kind === "threshold" && title.earn.metric === "polls-answered"
		? [{ id: title.id, target: title.earn.target }]
		: []
);

describe("the retire-titles migration", () => {
	it("retires twenty-five ids, none of which the roster still holds", () => {
		const rosterIds = new Set(TITLES.map((title) => title.id));

		expect(retiredIds).toHaveLength(25);
		expect(retiredIds.filter((id) => rosterIds.has(id))).toEqual([]);
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

	it("grants every poll-count rung at the target the roster reads", () => {
		expect(grantedRungs).toEqual(pollCountRungs);
	});

	it("grants from the counter the rungs are earned on", () => {
		expect(body).toContain(`progress."metric" = 'polls-answered'`);
	});

	it("marks the backfilled rungs announced, so they arrive without a notice each", () => {
		expect(body).toMatch(/"announced_at"\)\s*SELECT[^;]*now\(\), now\(\)/);
	});

	it("never overwrites a rung already held", () => {
		expect(body).toContain("ON CONFLICT");
		expect(body).toContain("DO NOTHING");
	});

	it("skips itself rather than failing when the table is not there yet", () => {
		expect(body).toContain("RAISE NOTICE");
		expect(body).toContain("RETURN;");
	});
});
