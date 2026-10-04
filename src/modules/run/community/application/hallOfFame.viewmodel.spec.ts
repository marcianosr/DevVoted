import { describe, expect, it } from "vitest";

import {
	COPY,
	type ChampionWin,
	hallOfFameFor,
} from "~/modules/run/community/application/hallOfFame.viewmodel";
import type { PlayerCardView } from "~/modules/run/community/application/playerCard.viewmodel";
import { TEST_DATES } from "~/test/kanto";

const RED: PlayerCardView = {
	userId: "red-from-pallet-town",
	displayName: "Red",
	titles: ["Champion"],
	theme: "gate-champion",
};

const win = (overrides: Partial<ChampionWin>): ChampionWin => ({
	runId: 1,
	userId: RED.userId,
	displayName: RED.displayName,
	wonAt: `${TEST_DATES.birthday}T14:05:00`,
	...overrides,
});

describe("hallOfFameFor", () => {
	it("states that nobody has summited while no win is recorded", () => {
		const hall = hallOfFameFor({ champion: null, wins: [] });

		expect(hall.champion).toBeUndefined();
		expect(hall.history).toEqual([]);
		expect(hall.empty).toBe(COPY.empty);
	});

	it("crowns the reigning champion with the date and time of the win", () => {
		const hall = hallOfFameFor({
			champion: { card: RED, wonAt: `${TEST_DATES.birthday}T14:05:00` },
			wins: [win({})],
		});

		expect(hall.champion?.card.name).toBe("Red");
		expect(hall.champion?.card.profileHref).toBe(
			"/profile/red-from-pallet-town"
		);
		expect(hall.champion?.since).toBe(COPY.since("13 May 2026, 14:05"));
	});

	it("lists every win in the order the server gave, one row per win", () => {
		const hall = hallOfFameFor({
			champion: { card: RED, wonAt: `${TEST_DATES.birthday}T14:05:00` },
			wins: [
				win({ runId: 3 }),
				win({
					runId: 2,
					userId: "blue",
					displayName: "Blue",
					wonAt: `${TEST_DATES.christmas}T09:30:00`,
				}),
				win({ runId: 1, wonAt: `${TEST_DATES.christmasEve}T21:00:00` }),
			],
		});

		expect(hall.history.map((row) => row.face.name)).toEqual([
			"Red",
			"Blue",
			"Red",
		]);
		expect(hall.history.map((row) => row.key)).toEqual(["3", "2", "1"]);
		expect(hall.history[1]?.wonAt).toBe("25 Dec 2025, 09:30");
	});

	it("links each face in the history to that player", () => {
		const hall = hallOfFameFor({
			champion: null,
			wins: [win({ userId: "blue", displayName: "Blue" })],
		});

		expect(hall.history[0]?.face.userId).toBe("blue");
	});
});
