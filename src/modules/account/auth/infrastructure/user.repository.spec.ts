import { beforeEach, describe, expect, it, vi } from "vitest";

import { userConfigUnlocksTable, usersTable } from "~/database/schema";
import { FREE_CONFIG_IDS } from "~/modules/run/config/domain/configUnlock.model";
import { insertUser } from "~/modules/account/auth/infrastructure/user.repository";
import {
	type DrizzleMockState,
	resetDrizzleMock,
} from "~/test/drizzleMock.factory";

const mock = vi.hoisted((): DrizzleMockState => ({
	results: [],
	setCalls: [],
	valuesCalls: [],
	insertTables: [],
	updateTables: [],
	deleteTables: [],
}));

vi.mock("~/database/db", async () => {
	const { createMockDb } = await import("~/test/drizzleMock.factory");
	return { db: createMockDb(mock) };
});

const insertedRow = {
	id: "red-from-pallet-town",
	email: "red@pallet.town",
	display_name: "Red",
	photo_url: null,
	is_guest: false,
};

const insertedGuestRow = {
	id: "missingno-from-cinnabar",
	email: null,
	display_name: "Guest",
	photo_url: null,
	is_guest: true,
};

describe("insertUser", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetDrizzleMock(mock);
	});

	it("seeds the free starter set with no provenance beside the account row", async () => {
		mock.results.push([insertedRow]);

		await insertUser({
			id: "red-from-pallet-town",
			email: "red@pallet.town",
			isGuest: false,
		});

		expect(mock.insertTables[0]).toBe(usersTable);
		expect(mock.insertTables[1]).toBe(userConfigUnlocksTable);
		expect(mock.valuesCalls[1]).toEqual(
			FREE_CONFIG_IDS.map((configId) => ({
				user_id: "red-from-pallet-town",
				config_id: configId,
				via_metric: null,
			}))
		);
	});

	it("returns the account user mapped from the inserted row", async () => {
		mock.results.push([insertedRow]);

		const user = await insertUser({
			id: "red-from-pallet-town",
			email: "red@pallet.town",
			displayName: "Red",
			isGuest: false,
		});

		expect(user).toEqual({
			id: "red-from-pallet-town",
			email: "red@pallet.town",
			displayName: "Red",
			photoUrl: null,
			isGuest: false,
		});
	});

	it("falls back to the email's local part when no display name is given", async () => {
		mock.results.push([insertedRow]);

		await insertUser({
			id: "red-from-pallet-town",
			email: "red@pallet.town",
			isGuest: false,
		});

		expect(mock.valuesCalls[0]).toMatchObject({ display_name: "red" });
	});

	it("stores a guest with no email, the guest flag and the guest name", async () => {
		mock.results.push([insertedGuestRow]);

		await insertUser({
			id: "missingno-from-cinnabar",
			email: null,
			isGuest: true,
		});

		expect(mock.valuesCalls[0]).toMatchObject({
			email: null,
			display_name: "Guest",
			is_guest: true,
		});
	});

	it("seeds a guest the same free starter set as an account", async () => {
		mock.results.push([insertedGuestRow]);

		await insertUser({
			id: "missingno-from-cinnabar",
			email: null,
			isGuest: true,
		});

		expect(mock.insertTables[1]).toBe(userConfigUnlocksTable);
		expect(mock.valuesCalls[1]).toHaveLength(FREE_CONFIG_IDS.length);
	});
});
