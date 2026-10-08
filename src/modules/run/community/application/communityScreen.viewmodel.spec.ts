import { describe, expect, it } from "vitest";

import { turnoutFor } from "~/modules/run/community/application/communityScreen.viewmodel";
import { EMPTY_DAY_TURNOUT } from "~/modules/run/community/domain/dayRecords.model";

const BROCK = { id: "brock", displayName: "Brock", you: false };
const MISTY = { id: "misty", displayName: "Misty", you: true };
const SHOWED_UP = { label: "answered today", count: "2", climbers: [] };

const bandLabelled = <Band extends { label: string }>(
	bands: readonly Band[] | undefined,
	label: string
): Band | undefined => bands?.find((band) => band.label === label);

describe("turnoutFor", () => {
	it("titles the panel as the day's records, since outcomes and records share one list", () => {
		expect(turnoutFor(EMPTY_DAY_TURNOUT, SHOWED_UP).title).toBe(
			"Today’s records"
		);
	});

	it("draws who showed up first, then every outcome in ladder order, an unreached one at zero", () => {
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
			{ label: "HEALTHY", count: "0", climbers: [] },
			{ label: "OK", count: "0", climbers: [] },
			{
				label: "SHAKY",
				caption: "gate held them",
				count: "1",
				color: "vermillion",
			},
			{ label: "DANGER", count: "0", climbers: [] },
		]);
	});

	it("hands every face to the row, so the stack can open the ones it folds", () => {
		const crowd = Array.from({ length: 5 }, (_, index) => ({
			...BROCK,
			id: `brock-${index}`,
		}));
		const band = bandLabelled(
			turnoutFor(
				{
					...EMPTY_DAY_TURNOUT,
					outcomes: { ...EMPTY_DAY_TURNOUT.outcomes, healthy: crowd },
				},
				SHOWED_UP
			).bands,
			"HEALTHY"
		);

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

		expect(
			bandLabelled(bands, "HEALTHY")?.climbers[0]?.onPress
		).toBeUndefined();
		bandLabelled(bands, "DANGER")?.climbers[0]?.onPress?.();
		expect(pressed).toEqual(["brock"]);
	});

	it("draws every outcome and record empty before anybody closed a gate", () => {
		const turnout = turnoutFor(EMPTY_DAY_TURNOUT, SHOWED_UP);

		expect(turnout.bands.map(({ count }) => count)).toEqual([
			"2",
			"0",
			"0",
			"0",
			"0",
			"0",
		]);
		expect(turnout.records?.map(({ label }) => label)).toEqual([
			"biggest build",
			"lightest build",
			"comeback",
			"most audits",
			"most installed",
			"most expensive build",
			"KB generated today",
			"KB spent today",
		]);
		expect(
			turnout.records?.every(
				({ count, climbers }) => count === "—" && climbers.length === 0
			)
		).toBe(true);
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

		expect(bandLabelled(turnout.records, "most installed")).toMatchObject({
			caption: ".ts",
			count: "2 players",
		});
	});

	it("leaves the caption off a most-installed row nobody holds, there being no config to name", () => {
		expect(
			bandLabelled(
				turnoutFor(EMPTY_DAY_TURNOUT, SHOWED_UP).records,
				"most installed"
			)?.caption
		).toBeUndefined();
	});
});
