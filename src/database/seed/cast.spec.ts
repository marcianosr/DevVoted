import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { SEED_CLIMBERS, SEED_PLAYERS } from "~/database/seed/cast";
import { findBorderById } from "~/domains/economy/data/borders";

const PUBLIC_DIR = "public";

describe("the seeded poll editors", () => {
	it("equips a border that the catalogue actually knows", () => {
		const unknown = SEED_CLIMBERS.filter(
			(climber) => findBorderById(climber.borderId) === undefined
		);

		expect(unknown.map((climber) => climber.displayName)).toEqual([]);
	});

	it("points every portrait at a file that ships in public/", () => {
		const missing = SEED_CLIMBERS.filter(
			(climber) => !existsSync(`${PUBLIC_DIR}${climber.photoUrl}`)
		);

		expect(missing.map((climber) => climber.photoUrl)).toEqual([]);
	});

	it("shares no name with a playable login, so nobody climbs against themselves", () => {
		const playerNames = SEED_PLAYERS.map((player) => player.displayName);
		const shared = SEED_CLIMBERS.filter((climber) =>
			playerNames.includes(climber.displayName)
		);

		expect(shared.map((climber) => climber.displayName)).toEqual([]);
	});
});
