import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

const sql = readFileSync(
	resolve(
		process.cwd(),
		"supabase/migrations/20261003200000_name_gates_after_kanto_cities.sql"
	),
	"utf8"
);

const body = sql.replace(/^\s*--.*$/gm, "");

const renames = [
	...body.matchAll(/\('(swatch-[a-z-]+)', '(swatch-[a-z-]+)'\)/g),
].map(([, from, to]) => ({ from, to }));

const rosterIds = new Set(ALL_SWATCHES.map((swatch) => swatch.id));

describe("the name-gates-after-kanto-cities migration", () => {
	it("renames the nine swatches that carried a badge name", () => {
		expect(renames).toHaveLength(9);
	});

	it("renames each one to an id the roster holds", () => {
		expect(renames.filter(({ to }) => !rosterIds.has(to))).toEqual([]);
	});

	it("renames only ids the roster no longer holds", () => {
		expect(renames.filter(({ from }) => rosterIds.has(from))).toEqual([]);
	});

	it("leaves every swatch the roster holds reachable, renamed or kept", () => {
		const renamedTo = new Set(renames.map(({ to }) => to));
		const kept = [...rosterIds].filter((id) => !renamedTo.has(id));

		expect(kept).toEqual([
			"swatch-pallet",
			"swatch-lavender",
			"swatch-seafoam",
			"swatch-champion",
		]);
	});

	it("keeps the order of the owned swatches", () => {
		expect(body).toContain("WITH ORDINALITY");
		expect(body).toContain("ORDER BY owned.position");
	});

	it("moves the worn swatch along with the owned ones", () => {
		expect(body).toContain(`SET "equipped_swatch_id" = r.new_id`);
	});

	it("skips itself rather than failing when the table is not there yet", () => {
		expect(body).toContain("RAISE NOTICE");
		expect(body).toContain("RETURN;");
	});
});
