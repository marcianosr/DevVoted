import { describe, expect, it } from "vitest";

import {
	recordsFor,
	showedUpBand,
	statsFor,
	turnoutFor,
} from "~/modules/run/community/application/communityScreen.viewmodel";
import { EMPTY_DAY_TURNOUT } from "~/modules/run/community/domain/dayRecords.model";

const BROCK = { id: "brock", displayName: "Brock", you: false };
const MISTY = { id: "misty", displayName: "Misty", you: true };
const SHOWED_UP = { label: "Answered today", count: "2", climbers: [] };

const bandLabelled = <Band extends { label: string }>(
	bands: readonly Band[] | undefined,
	label: string
): Band | undefined => bands?.find((band) => band.label === label);

describe("turnoutFor", () => {
	it("titles the outcomes panel by who cleared what", () => {
		expect(turnoutFor(EMPTY_DAY_TURNOUT, SHOWED_UP).title).toBe(
			"Who cleared what"
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

	it("draws every outcome at zero before anybody closed a gate", () => {
		const turnout = turnoutFor(EMPTY_DAY_TURNOUT, SHOWED_UP);

		expect(turnout.bands.map(({ count }) => count)).toEqual([
			"2",
			"0",
			"0",
			"0",
			"0",
			"0",
		]);
	});
});

describe("recordsFor", () => {
	it("titles the records panel as the day's records", () => {
		expect(recordsFor(EMPTY_DAY_TURNOUT).title).toBe("Today’s records");
	});

	it("draws every record with a dash and no faces before anybody closed a gate", () => {
		const { rows } = recordsFor(EMPTY_DAY_TURNOUT);

		expect(rows.map(({ label }) => label)).toEqual([
			"Biggest build",
			"Lightest build",
			"Comeback",
			"Most audits",
			"Most installed",
			"Most expensive build",
			"KB generated today",
			"KB spent today",
		]);
		expect(
			rows.every(
				({ count, climbers }) => count === "—" && climbers.length === 0
			)
		).toBe(true);
	});

	it("names the most installed config and how many players run it", () => {
		const { rows } = recordsFor({
			...EMPTY_DAY_TURNOUT,
			records: [
				{
					record: {
						id: "top-config",
						configId: "ts",
						configLabel: ".ts",
						configSlots: 1,
						figure: 2,
						holderIds: ["brock", "misty"],
					},
					holders: [MISTY, BROCK],
				},
			],
		});

		expect(bandLabelled(rows, "Most installed")).toMatchObject({
			config: { name: ".ts", slots: 1 },
			count: "2 players",
		});
	});

	it("draws no chip on a most-installed row nobody holds, there being no config to name", () => {
		const row = bandLabelled(
			recordsFor(EMPTY_DAY_TURNOUT).rows,
			"Most installed"
		);

		expect(row?.config).toBeUndefined();
		expect(row?.caption).toBeUndefined();
	});
});

describe("showedUpBand", () => {
	it("draws ten faces of who answered today before folding the rest", () => {
		expect(
			showedUpBand({ totalPlayers: 2, players: [BROCK, MISTY] }).shown
		).toBe(10);
	});
});

describe("statsFor", () => {
	it("counts the guests apart from the players", () => {
		expect(
			statsFor({ totalPlayers: 47, guestPlayers: 45, restingPlayers: 0 }).map(
				(stat) => stat.label
			)
		).toEqual(["47 players", "45 guests"]);
	});

	it("leaves the guest figure out when nobody played without an account", () => {
		expect(
			statsFor({ totalPlayers: 2, guestPlayers: 0, restingPlayers: 0 }).map(
				(stat) => stat.label
			)
		).toEqual(["2 players"]);
	});

	it("counts the climbers resting, who have not answered for days", () => {
		expect(
			statsFor({ totalPlayers: 5, guestPlayers: 0, restingPlayers: 2 }).map(
				(stat) => stat.label
			)
		).toEqual(["5 players", "2 resting"]);
	});
});
