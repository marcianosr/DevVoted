import { describe, expect, it } from "vitest";

import {
	ladderFor,
	ladderSummaryFor,
} from "~/modules/run/community/application/climbLadder.viewmodel";

const climber = (
	id: string,
	gate: number,
	pollsIntoGate: number,
	you = false
) => ({
	id,
	displayName: id,
	photoUrl: null,
	borderUrl: null,
	gate,
	pollsIntoGate,
	you,
});

describe("ladderFor", () => {
	const BLUE_BUILD = {
		configs: [
			{ id: "ts", label: ".ts", slots: 1, level: 4 },
			{ id: "cache", label: "Cache", slots: 4 },
		],
		vendorLockedConfigId: "cache",
	};
	const climb = {
		climbers: [
			climber("red", 1, 2, true),
			{ ...climber("blue", 1, 4), build: BLUE_BUILD },
			climber("green", 3, 0),
		],
		fallen: [
			{
				runId: 11,
				id: "koga",
				displayName: "Koga",
				photoUrl: null,
				borderUrl: null,
				gate: 2,
				pollsIntoGate: 1,
				build: { configs: [] },
			},
		],
		bestPosition: 16,
	};

	it("stacks climbers under their gate, deepest first", () => {
		const gates = ladderFor(climb);

		expect(gates[1].climbers.map((entry) => entry.id)).toEqual(["blue", "red"]);
		expect(gates[3].climbers.map((entry) => entry.id)).toEqual(["green"]);
	});

	it("marks the viewer's gate as current", () => {
		const gates = ladderFor(climb);

		expect(gates[1].current).toBe(true);
		expect(gates.filter((gate) => gate.current)).toHaveLength(1);
	});

	it("keys the fallen by run and parks them at their gate", () => {
		const gates = ladderFor(climb);

		expect(gates[2].fallen).toEqual([
			{
				id: "koga",
				name: "Koga",
				photoUrl: undefined,
				borderUrl: undefined,
				you: false,
				build: [],
				runKey: "11",
			},
		]);
	});

	it("hands a chip its build as plain names, versions and weights, flagging the vendor lock", () => {
		const gates = ladderFor(climb);

		const blue = gates[1].climbers.find((entry) => entry.id === "blue");
		expect(blue?.build).toEqual([
			{ name: ".ts", slots: 1, version: 4 },
			{ name: "Cache", slots: 4, locked: true },
		]);
	});

	it("leaves a chip plain when the map knows no build for it", () => {
		const gates = ladderFor(climb);

		const red = gates[1].climbers.find((entry) => entry.id === "red");
		expect(red).not.toHaveProperty("build");
	});

	it("charts up to the best position and leaves the rest uncharted", () => {
		const gates = ladderFor(climb);

		expect(gates[3].uncharted).toBe(false);
		expect(gates[4].uncharted).toBe(true);
		expect(gates[3].best).toBe(true);
	});

	it("charts only the viewer's own reach on a first climb", () => {
		const gates = ladderFor({ ...climb, bestPosition: null });

		expect(gates[1].uncharted).toBe(false);
		expect(gates[2].uncharted).toBe(true);
		expect(gates.every((gate) => !gate.best)).toBe(true);
	});
});

describe("ladderSummaryFor", () => {
	it("counts the climbers and the runs the gate killed today", () => {
		expect(
			ladderSummaryFor({
				climbers: [climber("red", 1, 2, true)],
				fallen: [
					{
						runId: 11,
						id: "koga",
						displayName: "Koga",
						photoUrl: null,
						borderUrl: null,
						gate: 2,
						pollsIntoGate: 1,
						build: { configs: [] },
					},
				],
				bestPosition: null,
			})
		).toBe("1 on the ladder · 1 fell today");
	});

	it("drops the fallen clause when every run today survived", () => {
		expect(
			ladderSummaryFor({
				climbers: [climber("red", 1, 2, true)],
				fallen: [],
				bestPosition: null,
			})
		).toBe("1 on the ladder");
	});

	it("states nothing when the viewer has no run to place", () => {
		expect(ladderSummaryFor(null)).toBeUndefined();
	});
});
