import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const sql = readFileSync(
	resolve(
		process.cwd(),
		"supabase/migrations/20261007120000_polls_author_reward_kb.sql"
	),
	"utf8"
);

const body = sql.replace(/^\s*--.*$/gm, "").replace(/\s+/g, " ");

describe("the polls-author-reward-kb migration", () => {
	it("adds the reward with the flat 16 KB every existing poll was promised", () => {
		expect(body).toContain(
			'ADD COLUMN IF NOT EXISTS "author_reward_kb" integer DEFAULT 16 NOT NULL;'
		);
	});

	it("leaves every existing poll at that default", () => {
		expect(body).not.toContain("UPDATE");
	});
});
