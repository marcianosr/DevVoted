import { describe, expect, it } from "vitest";

import {
	controldex,
	type ControldexEntry,
} from "~/modules/collection/dex/domain/controldex.model";
import { REGISTRY_CONTROL_IDS } from "~/modules/run/shop/domain/registryControl.model";

const entryFor = (
	unlockedServiceIds: readonly string[],
	id: string
): ControldexEntry => {
	const entry = controldex(unlockedServiceIds).find(
		(row) => row.control.id === id
	);
	if (!entry) throw new Error(`no controldex row for ${id}`);
	return entry;
};

describe("controldex", () => {
	it("lists every service on the roster, in roster order", () => {
		expect(controldex([]).map((entry) => entry.control.id)).toEqual(
			REGISTRY_CONTROL_IDS
		);
	});

	it("unlocks Rebuild for an account that has earned nothing, because it is a starter", () => {
		expect(entryFor([], "rebuild").unlocked).toBe(true);
	});

	it("locks every earned service until its grant row exists", () => {
		expect(entryFor([], "extend").unlocked).toBe(false);
		expect(entryFor([], "pin").unlocked).toBe(false);
		expect(entryFor([], "bootCache").unlocked).toBe(false);
	});

	it("carries the control on a locked row too, so the catalogue can name it", () => {
		expect(entryFor([], "extend").control.title).toBe("Extend the registry");
	});

	it("unlocks a service the ledger holds, and only that one", () => {
		expect(entryFor(["extend"], "extend").unlocked).toBe(true);
		expect(entryFor(["extend"], "pin").unlocked).toBe(false);
	});
});
