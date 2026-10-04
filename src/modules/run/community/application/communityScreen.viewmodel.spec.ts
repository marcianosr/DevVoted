import { describe, expect, it } from "vitest";

import { turnoutFor } from "~/modules/run/community/application/communityScreen.viewmodel";
import { EMPTY_DAY_TURNOUT } from "~/modules/run/community/domain/dayRecords.model";

const BROCK = { id: "brock", displayName: "Brock", you: false };
const MISTY = { id: "misty", displayName: "Misty", you: true };
const SHOWED_UP = { label: "answered today", count: "2", climbers: [] };

describe("turnoutFor", () => {
	it("titles the panel as the day's records, since outcomes and records share one list", () => {
		expect(turnoutFor(EMPTY_DAY_TURNOUT, SHOWED_UP).title).toBe(
			"Today’s records"
		);
	});

	it("draws who showed up first, then one row per outcome somebody reached, in ladder order", () => {
		const turnout = turnoutFor(
			{
				...EMPTY_DAY_TURNOUT,
				outcomes: {
					...EMPTY_DAY_TURNOUT.outcomes,
					shaky: [BROCK],
					perfect: [MISTY],
				},
			},
			SHOWED_UP
		);

		expect(turnout.bands).toMatchObject([
			SHOWED_UP,
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

	it("hands every face to the row, so the stack can open the ones it folds", () => {
		const crowd = Array.from({ length: 5 }, (_, index) => ({
			...BROCK,
			id: `brock-${index}`,
		}));
		const [, band] = turnoutFor(
			{
				...EMPTY_DAY_TURNOUT,
				outcomes: { ...EMPTY_DAY_TURNOUT.outcomes, healthy: crowd },
			},
			SHOWED_UP
		).bands;

		expect(band?.climbers).toHaveLength(5);
		expect(band?.overflow).toBe(0);
	});

	it("lets a fallen face be pressed, and only a fallen face", () => {
		const pressed: string[] = [];
		const { bands } = turnoutFor(
			{
				...EMPTY_DAY_TURNOUT,
				outcomes: {
					...EMPTY_DAY_TURNOUT.outcomes,
					healthy: [MISTY],
					danger: [BROCK],
				},
			},
			SHOWED_UP,
			(userId) => () => pressed.push(userId)
		);
		const [, healthy, danger] = bands;

		expect(healthy?.climbers[0]?.onPress).toBeUndefined();
		danger?.climbers[0]?.onPress?.();
		expect(pressed).toEqual(["brock"]);
	});

	it("draws only who showed up before anybody closed a gate", () => {
		expect(turnoutFor(EMPTY_DAY_TURNOUT, SHOWED_UP).bands).toEqual([SHOWED_UP]);
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
			SHOWED_UP
		);

		expect(turnout.records).toMatchObject([
			{ label: "most installed", caption: ".ts", count: "2 players" },
		]);
	});
});
