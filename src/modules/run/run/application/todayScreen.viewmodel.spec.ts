import { describe, expect, it } from "vitest";

import {
	createMockGateStake,
	createMockRunView,
	createMockShopControls,
} from "~/test/runView.factory";
import {
	climbersAtOrPast,
	communityLineFor,
	hubBuildFor,
	hubStripFor,
	incomingIncidentsFor,
	pollsBadgeFor,
	runSoFarFor,
	shopAsideFor,
	todayPressFor,
} from "~/modules/run/run/application/todayScreen.viewmodel";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import { CATEGORY_CODES } from "~/shared/lib/categories";

const answered = (index: number): AnsweredPoll => ({
	id: `poll-${index + 1}`,
	question: "Which town does the journey start in?",
	category: CATEGORY_CODES[0],
	outcome: "correct",
	picked: ["Pallet Town"],
});

const OPEN = { isOpen: true, remaining: "0m" };
const SHUT = { isOpen: false, remaining: "7h 23m" };

describe(todayPressFor, () => {
	it("offers a fresh start when no run is open", () => {
		const press = todayPressFor(null, SHUT);

		expect(press.kind).toBe("start");
		expect(press.label).toBe("Start today’s climb");
		expect(press.pollsLeft).toBe(SLICE_WINDOW);
	});

	it("offers a fresh start once the last run is over", () => {
		const press = todayPressFor(createMockRunView({ isOver: true }), SHUT);

		expect(press.kind).toBe("start");
		expect(press.label).toBe("Start today’s climb");
	});

	it("names the gate it continues to", () => {
		const press = todayPressFor(createMockRunView({ gatesCleared: 3 }), SHUT);

		expect(press.kind).toBe("resume");
		expect(press.label).toBe("Continue to Thunder");
	});

	it("sends the player to prep first while the gate has not started", () => {
		const press = todayPressFor(
			createMockRunView({ status: "rewarding", answeredThisGate: [] }),
			SHUT
		);

		expect(press.note).toBe("5 polls ready · prep first");
	});

	it("reads the poll's position once the gate is being answered", () => {
		const press = todayPressFor(
			createMockRunView({ status: "answering", answeredThisGate: [] }),
			SHUT
		);

		expect(press.note).toBe("Poll 1 out of 5");
	});

	it("warns that a part-answered day's leftovers do not carry to tomorrow", () => {
		const press = todayPressFor(
			createMockRunView({
				status: "answering",
				answeredThisGate: [answered(0), answered(1)],
				pollsLeftToday: 3,
			}),
			SHUT
		);

		expect(press.note).toBe(
			"Poll 3 out of 5 · 3 of today’s 5 left · they do not carry to tomorrow"
		);
	});

	it("counts the gate's remaining polls onto the mark, not the run's whole pool", () => {
		const press = todayPressFor(
			createMockRunView({
				pollsPerGate: 5,
				answeredThisGate: [answered(0), answered(1)],
				pollsLeftToday: 96,
			}),
			SHUT
		);

		expect(press.pollsLeft).toBe(3);
	});

	it("keeps the mark and the poll label telling the same story", () => {
		const view = createMockRunView({
			status: "answering",
			pollsPerGate: 5,
			answeredThisGate: [answered(0), answered(1)],
		});
		const press = todayPressFor(view, SHUT);

		expect(press.note).toContain("Poll 3 out of 5");
		expect(press.pollsLeft).toBe(3);
	});

	it("never counts past the gate once every poll in it is answered", () => {
		const press = todayPressFor(
			createMockRunView({
				pollsPerGate: 5,
				answeredThisGate: Array.from({ length: 6 }, answered),
			}),
			SHUT
		);

		expect(press.pollsLeft).toBe(0);
	});

	it("shuts and names when the gate opens once the day is spent", () => {
		const press = todayPressFor(
			createMockRunView({
				gatesCleared: 3,
				pollsExhausted: true,
				pollsLeftToday: 0,
			}),
			SHUT
		);

		expect(press.kind).toBe("locked");
		expect(press.label).toBe("Thunder opens in 7h 23m");
		expect(press.note).toBe("today’s polls are done · come back tomorrow");
	});

	it("reopens the moment the clock runs out, without a reload", () => {
		const press = todayPressFor(
			createMockRunView({ pollsExhausted: true, pollsLeftToday: 0 }),
			OPEN
		);

		expect(press.kind).toBe("resume");
	});
});

describe(hubStripFor, () => {
	it("states the run, the gate reached and the balance", () => {
		expect(
			hubStripFor(createMockRunView({ gatesCleared: 3, storage: 106 }), 14)
		).toMatchObject({ runNumber: 14, gate: 3, gates: 12, storage: 106 });
	});

	it("has no strip before a run is open", () => {
		expect(hubStripFor(null, 14)).toBeNull();
	});
});

describe(runSoFarFor, () => {
	const closes = [
		{ gate: 0, band: "perfect", cleared: true, kb: 32 },
		{ gate: 1, band: "healthy", cleared: true, kb: 19 },
		{ gate: 2, band: "ok", cleared: true, kb: 13 },
	] as const;

	it("lists every closed gate with its grade and what it earned", () => {
		const soFar = runSoFarFor(createMockRunView({ gatesCleared: 3, closes }));

		expect(
			soFar?.rows.map((row) => [row.swatch.gateName, row.band.label, row.kb])
		).toEqual([
			["Pallet", "PERFECT", "+32 KB"],
			["Boulder", "HEALTHY", "+19 KB"],
			["Cascade", "OK", "+13 KB"],
		]);
		expect(soFar?.earned).toBe("+64 KB");
	});

	it("shows a held gate once, by the close that finally cleared it", () => {
		const soFar = runSoFarFor(
			createMockRunView({
				gatesCleared: 1,
				closes: [
					{ gate: 0, band: "shaky", cleared: false, kb: 0 },
					{ gate: 0, band: "ok", cleared: true, kb: 12 },
				],
			})
		);

		expect(soFar?.rows).toHaveLength(1);
		expect(soFar?.rows[0]?.band.label).toBe("OK");
	});

	it("projects the next gate from the coverage held and a clean clear", () => {
		const soFar = runSoFarFor(
			createMockRunView({
				gatesCleared: 3,
				answeredThisGate: [answered(0)],
				fullClearKb: 40,
				gateStake: createMockGateStake({ coverageHeld: 40 }),
			})
		);

		expect(soFar?.next).toMatchObject({
			started: true,
			share: "40%",
			kb: "+40 KB",
		});
		expect(soFar?.next?.swatch.gateName).toBe("Thunder");
	});

	it("reads the next gate as not started until its first poll is answered", () => {
		const soFar = runSoFarFor(
			createMockRunView({
				answeredThisGate: [],
				gateStake: createMockGateStake({ coverageHeld: 0.9 }),
			})
		);

		expect(soFar?.next?.started).toBe(false);
	});

	it("drops the next gate once the run is over", () => {
		expect(runSoFarFor(createMockRunView({ isOver: true }))?.next).toBeNull();
	});
});

describe(hubBuildFor, () => {
	it("lists each installed config with its weight and version", () => {
		const build = hubBuildFor(
			createMockRunView({
				installed: [
					{
						config: { ...CONFIGS.codeCoverage, level: 2 },
						slots: 2,
						canMinify: false,
						minifySavingSlots: 0,
					},
				],
				slotsUsed: 4,
				slots: 6,
				slotsFree: 2,
			})
		);

		expect(build).toEqual({
			rows: [
				{ id: "code-coverage", name: "Code Coverage", slots: 2, version: 2 },
			],
			weight: "4 / 6",
			free: 2,
		});
	});

	it("has no build before a run is open", () => {
		expect(hubBuildFor(null)).toBeNull();
	});
});

describe(incomingIncidentsFor, () => {
	it("names a rival's incident waiting at the next gate", () => {
		const view = createMockRunView({
			gatesCleared: 3,
			audits: [
				{
					id: "not-found",
					code: 404,
					name: "Not Found",
					description: "",
					suppressed: false,
					sentBy: { id: "erika", name: "erika" },
				},
			],
		});

		expect(incomingIncidentsFor(view)).toEqual([
			{
				id: "not-found",
				code: 404,
				name: "Not Found",
				cue: "waits at Thunder · it replaces one audit",
				sender: "@erika",
			},
		]);
	});

	it("leaves out the gate's own drawn audits", () => {
		const view = createMockRunView({
			audits: [
				{
					id: "not-found",
					code: 404,
					name: "Not Found",
					description: "",
					suppressed: false,
				},
			],
		});

		expect(incomingIncidentsFor(view)).toEqual([]);
	});
});

describe(climbersAtOrPast, () => {
	it("counts other climbers at the gate or past it, never you", () => {
		expect(
			climbersAtOrPast(
				[
					{ gate: 2, you: false },
					{ gate: 3, you: false },
					{ gate: 5, you: false },
					{ gate: 3, you: true },
				],
				3
			)
		).toBe(2);
	});
});

describe(communityLineFor, () => {
	it("keeps the count apart from its wording so the figure can be badged", () => {
		expect(communityLineFor(8)).toMatchObject({
			count: 8,
			detail: "players answered today",
		});
	});

	it("drops the plural for a room of one", () => {
		expect(communityLineFor(1)).toMatchObject({
			count: 1,
			detail: "player answered today",
		});
	});

	it("names how many are at the next gate or ahead", () => {
		expect(communityLineFor(38, { count: 4, gate: 3 })).toMatchObject({
			ahead: 4,
			aheadDetail: "at Thunder or ahead",
		});
	});

	it("states nothing until the room has been counted", () => {
		expect(communityLineFor(undefined)).toBeNull();
	});
});

describe(shopAsideFor, () => {
	it("opens the shop only while the gate is paying out", () => {
		expect(
			shopAsideFor(createMockRunView({ status: "rewarding" }), SHUT).open
		).toBe(true);
	});

	it("says the shop stays open until the gate starts", () => {
		const shop = shopAsideFor(createMockRunView({ status: "rewarding" }), SHUT);

		expect(shop.detail).toBe("open until you start");
		expect(shop.highlighted).toBe(false);
	});

	it("stops putting a skipped shop forward, since its registry is shut", () => {
		const shop = shopAsideFor(
			createMockRunView({
				status: "rewarding",
				pollsExhausted: true,
				shopControls: createMockShopControls({ shopSkipped: true }),
			}),
			SHUT
		);

		expect(shop.detail).toBe("skipped");
		expect(shop.highlighted).toBe(false);
	});

	it("puts the shop forward with the balance to spend while the day waits", () => {
		const shop = shopAsideFor(
			createMockRunView({
				status: "rewarding",
				pollsExhausted: true,
				storage: 106,
			}),
			SHUT
		);

		expect(shop.detail).toBe("spend 106 KB");
		expect(shop.highlighted).toBe(true);
	});

	it("shuts the shop mid-gate and names itself plus the reason, for the label", () => {
		const shop = shopAsideFor(createMockRunView({ status: "answering" }), SHUT);

		expect(shop.open).toBe(false);
		expect(shop.hint).toBe("Shop · the shop opens when you clear a gate");
	});

	it("shuts the shop before a run is open", () => {
		expect(shopAsideFor(null, SHUT).open).toBe(false);
	});
});

describe(pollsBadgeFor, () => {
	it("counts the whole day before a run is open", () => {
		expect(pollsBadgeFor(null, SHUT)).toBe(SLICE_WINDOW);
	});

	it("counts the whole day again once the run is over", () => {
		expect(pollsBadgeFor(createMockRunView({ isOver: true }), SHUT)).toBe(
			SLICE_WINDOW
		);
	});

	it("counts down what the gate has left, not the whole run's pool", () => {
		const view = createMockRunView({
			answeredThisGate: [answered(0), answered(1)],
			pollsLeftToday: 96,
		});

		expect(pollsBadgeFor(view, SHUT)).toBe(3);
	});

	it("counts one on the gate's last poll", () => {
		const view = createMockRunView({
			answeredThisGate: [answered(0), answered(1), answered(2), answered(3)],
		});

		expect(pollsBadgeFor(view, SHUT)).toBe(1);
	});

	it("states nothing rather than a nought once the gate is answered out", () => {
		const view = createMockRunView({
			answeredThisGate: [
				answered(0),
				answered(1),
				answered(2),
				answered(3),
				answered(4),
			],
		});

		expect(pollsBadgeFor(view, SHUT)).toBeUndefined();
	});

	it("states nothing once the day has no polls left", () => {
		const view = createMockRunView({ pollsExhausted: true });

		expect(pollsBadgeFor(view, SHUT)).toBeUndefined();
	});

	it("goes back to counting the moment the day rolls over", () => {
		const view = createMockRunView({ pollsExhausted: true });

		expect(pollsBadgeFor(view, OPEN)).toBe(SLICE_WINDOW);
	});
});
