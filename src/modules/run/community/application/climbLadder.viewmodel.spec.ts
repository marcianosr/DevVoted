import { describe, expect, it, vi } from "vitest";

import {
	fileOf,
	LOOT_COPY,
	ladderFor,
} from "~/modules/run/community/application/climbLadder.viewmodel";
import type {
	ClimbFallen,
	ClimbTodayView,
} from "~/modules/run/community/application/community.service";
import type {
	FileHand,
	LootHand,
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
				titles: ["Completionist"],
				theme: "cascade",
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
				lootKb: 67,
				lootedById: null,
				lootedByName: null,
			},
		],
		bestPosition: 16,
		viewer: { id: "red", hasLiveRun: true },
	};

	const koga = (over: Partial<ClimbFallen> = {}): ClimbTodayView => ({
		...climb,
		fallen: [{ ...climb.fallen[0], ...over }],
	});

	const lootPressOn = (view: ClimbTodayView, hand?: LootHand) =>
		ladderFor(view, [], hand).flatMap((gate) => gate.fallen)[0].card?.loot;

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
		expect(blue?.card?.standing?.build).toEqual([
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

	it("links the card to the climber's in-game page and wears their titles and swatch", () => {
		const gates = ladderFor(climb);

		const blue = gates[1].climbers.find((entry) => entry.id === "blue");
		expect(blue?.card).toMatchObject({
			profileHref: "/profile/blue",
			titles: ["Completionist"],
			theme: "cascade",
		});
	});

	it("states the gate a climber stands at and the coverage they hold", () => {
		const gates = ladderFor(climb);

		const blue = gates[1].climbers.find((entry) => entry.id === "blue");
		expect(blue?.card?.standing?.gate).toMatchObject({
			name: "Boulder",
			label: "gate 1",
			coverage: { held: 42 },
		});
	});

	it("measures the build against the space it rents, the vendor lock exempt", () => {
		const gates = ladderFor(climb);

		const blue = gates[1].climbers.find((entry) => entry.id === "blue");
		expect(blue?.card?.standing?.weight).toBe("5 / 4");
	});

	it("tiles the run storage, the streak and the best category", () => {
		const gates = ladderFor(climb);

		const blue = gates[1].climbers.find((entry) => entry.id === "blue");
		expect(blue?.card?.standing?.stats).toEqual([
			{ label: "run storage", value: "896 KB", color: "saffron" },
			{ label: "streak", value: "6" },
			{ label: "best", value: "JavaScript" },
		]);
	});

	it("reads no best category for a player who has never been right", () => {
		const gates = ladderFor(climb);

		const koga = gates[2].fallen[0];
		expect(koga.card?.standing?.stats[2]).toEqual({
			label: "best",
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

	describe("the loot a fallen run carries", () => {
		const hand: LootHand = { onLoot: () => undefined };

		it("offers the take, naming the figure on the press", () => {
			expect(lootPressOn(koga(), hand)).toMatchObject({
				label: LOOT_COPY.take("67 KB"),
			});
		});

		it("hands the press the fallen run's id", () => {
			const taken: number[] = [];
			lootPressOn(koga(), {
				onLoot: (runId) => taken.push(runId),
			})?.onPress?.();

			expect(taken).toEqual([11]);
		});

		it("holds the press while that run's take is in flight", () => {
			expect(lootPressOn(koga(), { ...hand, pendingRunId: 11 })?.pending).toBe(
				true
			);
			expect(lootPressOn(koga(), { ...hand, pendingRunId: 12 })?.pending).toBe(
				false
			);
		});

		it("states the figure without a press when the reader has no run", () => {
			const parked = { ...koga(), viewer: { id: "red", hasLiveRun: false } };

			expect(lootPressOn(parked, hand)).toEqual({
				label: LOOT_COPY.unbanked("67 KB"),
			});
		});

		it("states the figure without a press on the reader's own fallen run", () => {
			const yours = { ...koga(), viewer: { id: "koga", hasLiveRun: true } };

			expect(lootPressOn(yours, hand)).toEqual({
				label: LOOT_COPY.unbanked("67 KB"),
			});
		});

		it("names who got there first once a run is spent", () => {
			const spent = koga({ lootedById: "blue", lootedByName: "Blue" });

			expect(lootPressOn(spent, hand)).toEqual({
				label: LOOT_COPY.takenBy("Blue", "67 KB"),
			});
		});

		it("says so when the reader is the one who took it", () => {
			const mine = koga({ lootedById: "red", lootedByName: "Red" });

			expect(lootPressOn(mine, hand)).toEqual({
				label: LOOT_COPY.takenByYou("67 KB"),
			});
		});

		it("names an unnamed looter rather than leaving a gap", () => {
			const spent = koga({ lootedById: "ghost", lootedByName: null });

			expect(lootPressOn(spent, hand)).toEqual({
				label: LOOT_COPY.takenBy(LOOT_COPY.someone, "67 KB"),
			});
		});

		it("says a run that banked everything has nothing to take", () => {
			expect(lootPressOn(koga({ lootKb: 0 }), hand)).toEqual({
				label: LOOT_COPY.empty,
			});
		});
	});
});

describe("the incident you hold, offered on a climber's card", () => {
	const MISTY = "misty";
	const hand = (overrides: Partial<FileHand> = {}): FileHand => ({
		audit: "409 Conflict",
		targetRunIdByUserId: new Map([[MISTY, 7]]),
		onFile: () => {},
		...overrides,
	});

	it("offers no filing at all while your hand is empty", () => {
		expect(fileOf(MISTY, undefined)).toBeUndefined();
	});

	it("names the audit it would file at a rival in reach", () => {
		expect(fileOf(MISTY, hand())).toMatchObject({
			label: "File 409 Conflict",
		});
	});

	it("files against that rival's run, not their user", () => {
		const onFile = vi.fn();

		fileOf(MISTY, hand({ onFile }))?.onPress?.();

		expect(onFile).toHaveBeenCalledWith(7);
	});

	it("refuses a climber the audit cannot reach, and says so", () => {
		const press = fileOf("brock", hand());

		expect(press?.onPress).toBeUndefined();
		expect(press?.refusal).toBe("409 Conflict cannot reach them");
	});

	it("holds the press while a filing at that rival is in flight", () => {
		expect(fileOf(MISTY, hand({ pendingRunId: 7 }))?.pending).toBe(true);
		expect(fileOf(MISTY, hand({ pendingRunId: 9 }))?.pending).toBe(false);
	});
});
