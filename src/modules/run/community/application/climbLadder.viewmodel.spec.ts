import { describe, expect, it } from "vitest";

import { ladderFor } from "~/modules/run/community/application/climbLadder.viewmodel";
import type { ClimbTodayView } from "~/modules/run/community/application/community.service";

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
	startedAtGate: 0,
});

describe("ladderFor", () => {
	const BLUE_BUILD = {
		configs: [
			{ id: "ts", label: ".ts", slots: 1, level: 4 },
			{ id: "cache", label: "Cache", slots: 4 },
		],
		vendorLockedConfigId: "cache",
	};
	const climb: ClimbTodayView = {
		climbers: [
			{ ...climber("red", 1, 2, true), closingBand: "shaky" },
			{
				...climber("blue", 1, 4),
				build: BLUE_BUILD,
				closingBand: "perfect",
				startedAtGate: 1,
				handle: "bluehandle",
				title: "Completionist",
				coveragePercent: 42,
				streak: 6,
				storageKb: 896,
				bestCategory: "js",
			},
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
				closingBand: "danger",
				startedAtGate: 0,
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

		expect(gates[2].fallen).toHaveLength(1);
		expect(gates[2].fallen[0]).toMatchObject({
			id: "koga",
			name: "Koga",
			you: false,
			rival: false,
			rescued: false,
			runKey: "11",
		});
	});

	it("hands a card its build as config chips, the vendor lock badged", () => {
		const gates = ladderFor(climb);

		const blue = gates[1].climbers.find((entry) => entry.id === "blue");
		expect(blue?.card?.build).toEqual([
			{ name: ".ts", slots: 1, version: 4, badges: [] },
			{
				name: "Cache",
				slots: 4,
				badges: [{ label: "locked in", color: "saffron" }],
			},
		]);
	});

	it("gives a card no one can read no card at all", () => {
		const gates = ladderFor(climb);

		const red = gates[1].climbers.find((entry) => entry.id === "red");
		expect(red).not.toHaveProperty("card");
	});

	it("states where a climber stands, how they closed and what they banked", () => {
		const gates = ladderFor(climb);

		const blue = gates[1].climbers.find((entry) => entry.id === "blue");
		expect(blue?.card).toMatchObject({
			handle: "bluehandle",
			title: "Completionist",
			gate: "gate 1 · Boulder",
			band: "perfect",
			coveragePercent: 42,
			storage: "896 KB",
		});
	});

	it("measures the build against the space it rents, the vendor lock exempt", () => {
		const gates = ladderFor(climb);

		const blue = gates[1].climbers.find((entry) => entry.id === "blue");
		expect(blue?.card?.weight).toBe("5 of 4 weight");
	});

	it("tiles the streak, the best category and the gate", () => {
		const gates = ladderFor(climb);

		const blue = gates[1].climbers.find((entry) => entry.id === "blue");
		expect(blue?.card?.stats).toEqual([
			{ label: "current streak", value: "6" },
			{ label: "best category", value: "JavaScript" },
			{ label: "current gate", value: "1" },
		]);
	});

	it("reads no best category for a player who has never been right", () => {
		const gates = ladderFor(climb);

		const koga = gates[2].fallen[0];
		expect(koga.card?.stats[1]).toEqual({
			label: "best category",
			value: "—",
		});
	});

	it("rings the climbers the viewer traded audits with today", () => {
		const gates = ladderFor(climb, ["blue"]);

		const rivals = gates.flatMap((gate) =>
			gate.climbers.filter((entry) => entry.rival).map((entry) => entry.id)
		);
		expect(rivals).toEqual(["blue"]);
	});

	it("rings nobody when the viewer traded no audits", () => {
		const gates = ladderFor(climb);

		expect(
			gates.every((gate) => gate.climbers.every((entry) => !entry.rival))
		).toBe(true);
	});

	it("reads a perfect and a shaky close off the chip's last gate", () => {
		const gates = ladderFor(climb);

		const [blue, red] = gates[1].climbers;
		expect(blue.mark).toBe("perfect");
		expect(red.mark).toBe("shaky");
	});

	it("marks nothing on a chip with no close to show", () => {
		const gates = ladderFor(climb);

		expect(gates[3].climbers[0]).not.toHaveProperty("mark");
		expect(gates[2].fallen[0]).not.toHaveProperty("mark");
	});

	it("marks a run a git tag resumed as rescued", () => {
		const gates = ladderFor(climb);

		const [blue, red] = gates[1].climbers;
		expect(blue.rescued).toBe(true);
		expect(red.rescued).toBe(false);
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
