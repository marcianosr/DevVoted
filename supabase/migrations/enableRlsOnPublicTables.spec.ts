import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const sql = readFileSync(
	resolve(
		process.cwd(),
		"supabase/migrations/20261002120000_enable_rls_on_public_tables.sql"
	),
	"utf8"
);

describe("the enable-rls-on-public-tables migration", () => {
	it("enables row-level security on every public table the database holds, not a fixed list", () => {
		expect(sql).toContain("FROM pg_tables WHERE schemaname = 'public'");
		expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
	});

	it("touches only tables still unprotected, so a re-run does nothing", () => {
		expect(sql).toContain("AND NOT rowsecurity");
	});

	it("adds no policy, so the public key reaches no rows", () => {
		expect(sql).not.toContain("CREATE POLICY");
	});
});
