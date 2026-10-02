import { describe, expect, it } from "vitest";

import { turnoutFor } from "~/modules/run/community/application/communityScreen.viewmodel";
import { EMPTY_DAY_TURNOUT } from "~/modules/run/community/domain/dayRecords.model";
import { TEST_DATES } from "~/test/kanto";

const BROCK = { id: "brock", displayName: "Brock", you: false };
const MISTY = { id: "misty", displayName: "Misty", you: true };
const SHOWED_UP = { label: "answered today", count: "2", climbers: [] };
const WHEN = TEST_DATES.christmas;

describe("turnoutFor", () => {
	it("draws one row per outcome somebody reached, in ladder order", () => {
		const turnout = turnoutFor(
			{
				...EMPTY_DAY_TURNOUT,
				outcomes: {
					...EMPTY_DAY_TURNOUT.outcomes,
					shaky: [BROCK],
					perfect: [MISTY],
				},
			},
			WHEN,
			SHOWED_UP
		);

		expect(turnout.bands).toMatchObject([
			{
				label: "PERFECT",
				caption: "finished at 100%",
				count: "1",
				color: "cerulean",
			},
			{
				label: "SHAKY",
				caption: "gate held them",
				count: "1",
				color: "vermillion",
			},
		]);
	});

	it("falls back to who showed up before anybody closed a gate", () => {
		expect(turnoutFor(EMPTY_DAY_TURNOUT, WHEN, SHOWED_UP).bands).toEqual([
			SHOWED_UP,
		]);
	});

	it("names the most installed config and how many players run it", () => {
		const turnout = turnoutFor(
			{
				...EMPTY_DAY_TURNOUT,
				records: [
					{
						record: {
							id: "top-config",
							configId: "ts",
							configLabel: ".ts",
							figure: 2,
							holderIds: ["brock", "misty"],
						},
						holders: [MISTY, BROCK],
					},
				],
			},
			WHEN,
			SHOWED_UP
		);

		expect(turnout.records).toMatchObject([
			{ label: "most installed", caption: ".ts", count: "2 players" },
		]);
	});
});
