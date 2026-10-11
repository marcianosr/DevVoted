import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { SEED_CLIMBERS, SEED_PLAYERS } from "~/database/seed/cast";
import { findBorderById } from "~/modules/account/profile/domain/border.model";

const PUBLIC_DIR = "public";

describe("the seeded poll editors", () => {
	it("equips a border that the catalogue actually knows", () => {
		const unknown = SEED_CLIMBERS.filter(
			(climber) => findBorderById(climber.borderId) === undefined
		);

		expect(unknown.map((climber) => climber.displayName)).toEqual([]);
	});

	it("points every portrait it names at a file that ships in public/", () => {
		const missing = [...SEED_CLIMBERS, ...SEED_PLAYERS].filter(
			(seeded) =>
				seeded.photoUrl !== undefined &&
				!existsSync(`${PUBLIC_DIR}${seeded.photoUrl}`)
		);

		expect(missing.map((seeded) => seeded.photoUrl)).toEqual([]);
	});

	it("hands every climber an id and a login of their own", () => {
		const ids = SEED_CLIMBERS.map((climber) => climber.id);
		const emails = SEED_CLIMBERS.map((climber) => climber.email);

		expect(new Set(ids).size).toBe(ids.length);
		expect(new Set(emails).size).toBe(emails.length);
	});

	it("shares no name with a playable login, so nobody climbs against themselves", () => {
		const playerNames = SEED_PLAYERS.map((player) => player.displayName);
		const shared = SEED_CLIMBERS.filter((climber) =>
			playerNames.includes(climber.displayName)
		);

		expect(shared.map((climber) => climber.displayName)).toEqual([]);
	});
});
