import { is } from "drizzle-orm";
import { getTableConfig, PgTable } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import * as schema from "~/database/schema";

const tables = Object.values(schema).filter((value) => is(value, PgTable));

describe("schema", () => {
	it("finds the tables it guards", () => {
		expect(tables.length).toBeGreaterThan(0);
	});

	it("enables row-level security on every table, so the public key reaches no rows", () => {
		const unprotected = tables
			.map(getTableConfig)
			.filter((config) => !config.enableRLS)
			.map((config) => config.name);

		expect(unprotected).toEqual([]);
	});
});
