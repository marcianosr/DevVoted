import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import { FREE_CONFIG_IDS } from "~/modules/run/config/domain/configUnlock.model";

const sql = readFileSync(
	resolve(
		process.cwd(),
		"supabase/migrations/20260930090000_linter_replaces_eslint_and_stylelint.sql"
	),
	"utf8"
);

const body = sql.replace(/^\s*--.*$/gm, "");

const rosterHolds = (id: string): boolean =>
	CONFIG_LIST.some((config) => config.id === id);

describe("the linter-replaces-eslint-and-stylelint migration", () => {
	it("grants linter, which the roster holds and signup gives free", () => {
		expect(body).toContain("'linter'");
		expect(FREE_CONFIG_IDS).toContain("linter");
		expect(rosterHolds("linter")).toBe(true);
	});

	it("deletes the two ids the roster no longer holds", () => {
		expect(body).toContain("IN ('eslint', 'stylelint')");
		expect(rosterHolds("eslint")).toBe(false);
		expect(rosterHolds("stylelint")).toBe(false);
	});

	it("grants before it deletes, so the first-install mark carries over from ESLint", () => {
		expect(body.indexOf('INSERT INTO "user_config_unlocks"')).toBeLessThan(
			body.indexOf('DELETE FROM "user_config_unlocks"')
		);
		expect(body).toContain("first_installed_at");
	});

	it("skips itself rather than failing when the table is not there yet", () => {
		expect(body).toContain("RAISE NOTICE");
		expect(body).toContain("RETURN;");
	});
});
