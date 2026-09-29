import { describe, expect, it } from "vitest";

import { createMockGateStake, createMockRunView } from "~/test/runView.factory";
import {
	communityLineFor,
	coverageReadingFor,
	rungsFor,
	pollsBadgeFor,
	pollsNoteFor,
	shopAsideFor,
	standingFor,
	todayPressFor,
} from "~/modules/run/run/application/todayScreen.viewmodel";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import { CATEGORY_CODES } from "~/shared/lib/categories";

const today = (pollsLeftToday: number) => ({
	pollsLeftToday,
	pollsPerGate: SLICE_WINDOW,
});

const answered = (index: number): AnsweredPoll => ({
	id: `poll-${index + 1}`,
	question: "Which town does the journey start in?",
	category: CATEGORY_CODES[0],
	outcome: "correct",
	picked: ["Pallet Town"],
});

const OPEN = { isOpen: true, remaining: "0m" };
const SHUT = { isOpen: false, remaining: "7h 23m" };

describe(pollsNoteFor, () => {
	it("calls the day ready while every poll of it is still there", () => {
		expect(pollsNoteFor(today(SLICE_WINDOW))).toBe("today’s 5 polls are ready");
	});

	it("states what is left and that it expires, once the day is part-answered", () => {
		expect(pollsNoteFor(today(3))).toBe(
			"3 of today’s 5 left · they do not carry to tomorrow"
		);
	});

	it("warns on the last poll of a part-answered day", () => {
		expect(pollsNoteFor(today(1))).toBe(
			"1 of today’s 5 left · they do not carry to tomorrow"
		);
	});

	it("says the day is answered once every poll of it is spent", () => {
		expect(pollsNoteFor(today(0))).toBe("today’s 5 polls are answered");
	});

	it("reads a restarted run's short segment as a part-answered day", () => {
		expect(pollsNoteFor(today(2))).toBe(
			"2 of today’s 5 left · they do not carry to tomorrow"
		);
	});

	it("never quotes a clock, which is the press's to state", () => {
		for (const left of [0, 1, 3, SLICE_WINDOW])
			expect(pollsNoteFor(today(left))).not.toMatch(/\d+[hm]\b/);
	});
});

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

	it("names the gate it resumes onto", () => {
		const press = todayPressFor(createMockRunView({ gatesCleared: 1 }), SHUT);

		expect(press.kind).toBe("resume");
		expect(press.label).toBe("Resume Boulder");
	});

	it("reads the poll's position in the gate beside the clock", () => {
		const press = todayPressFor(
			createMockRunView({ pollsPerGate: 5, answeredThisGate: [] }),
			SHUT
		);

		expect(press.note).toBe("Poll 1 out of 5 · New polls in 7h 23m");
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

	it("shuts and takes the clock as its label once the day is spent", () => {
		const press = todayPressFor(
			createMockRunView({
				pollsExhausted: true,
				pollsLeftToday: 0,
				answeredThisGate: [],
			}),
			SHUT
		);

		expect(press.kind).toBe("locked");
		expect(press.label).toBe("New polls in 7h 23m");
		expect(press.note).toBe("Poll 1 out of 5");
	});

	it("leaves the day's leftovers to the standing line, never restating them", () => {
		for (const view of [
			null,
			createMockRunView({ pollsLeftToday: 3 }),
			createMockRunView({ pollsExhausted: true, pollsLeftToday: 0 }),
		])
			expect(todayPressFor(view, SHUT).note).not.toMatch(/today’s/);
	});

	it("reopens the moment the clock runs out, without a reload", () => {
		const press = todayPressFor(
			createMockRunView({ pollsExhausted: true, pollsLeftToday: 0 }),
			OPEN
		);

		expect(press.kind).toBe("resume");
	});
});

describe(standingFor, () => {
	it("states the gate reached and what is stored against it", () => {
		expect(
			standingFor(createMockRunView({ gatesCleared: 4, storage: 296 }))
		).toBe("gate 4 of 12 · 296 KB stored · today’s 5 polls are ready");
	});

	it("calls the storage banked once the run is over", () => {
		expect(
			standingFor(
				createMockRunView({ gatesCleared: 4, storage: 296, isOver: true })
			)
		).toBe("gate 4 of 12 · 296 KB banked · today’s 5 polls are ready");
	});

	it("warns that a part-answered day's leftovers expire, which only it says", () => {
		expect(
			standingFor(
				createMockRunView({ gatesCleared: 4, storage: 296, pollsLeftToday: 3 })
			)
		).toBe(
			"gate 4 of 12 · 296 KB stored · 3 of today’s 5 left · they do not carry to tomorrow"
		);
	});
});

describe(rungsFor, () => {
	it("names both clearing rungs and keeps each band beside its percentage", () => {
		expect(rungsFor({ floor: 20, ok: 40, healthy: 60 })).toEqual([
			{ band: "ok", label: "OK", at: "40%" },
			{ band: "healthy", label: "HEALTHY", at: "60%" },
		]);
	});

	it("rounds a rung to one decimal rather than quoting the raw ratio", () => {
		expect(rungsFor({ floor: 0, ok: 33.333, healthy: 66.666 })).toEqual([
			{ band: "ok", label: "OK", at: "33.3%" },
			{ band: "healthy", label: "HEALTHY", at: "66.7%" },
		]);
	});
});

describe(coverageReadingFor, () => {
	it("reads coverage held against the healthy rung", () => {
		const reading = coverageReadingFor(
			createMockRunView({
				gateStake: createMockGateStake({
					coverageHeld: 42,
					coverageLadder: { floor: 20, ok: 40, healthy: 60 },
				}),
			})
		);

		expect(reading).toEqual({
			held: 42,
			demand: 60,
			rungs: [
				{ band: "ok", label: "OK", at: "40%" },
				{ band: "healthy", label: "HEALTHY", at: "60%" },
			],
		});
	});

	it("has nothing to read before a run is open", () => {
		expect(coverageReadingFor(null)).toBeNull();
	});

	it("has nothing to read once the run is over", () => {
		expect(coverageReadingFor(createMockRunView({ isOver: true }))).toBeNull();
	});
});

describe(communityLineFor, () => {
	it("keeps the count apart from its wording so the figure can be badged", () => {
		expect(communityLineFor(8)).toEqual({
			count: 8,
			detail: "players answered today",
		});
	});

	it("drops the plural for a room of one", () => {
		expect(communityLineFor(1)).toEqual({
			count: 1,
			detail: "player answered today",
		});
	});

	it("states nothing until the room has been counted", () => {
		expect(communityLineFor(undefined)).toBeNull();
	});
});

describe(shopAsideFor, () => {
	it("opens the shop only while the gate is paying out", () => {
		expect(shopAsideFor(createMockRunView({ status: "rewarding" })).open).toBe(
			true
		);
	});

	it("shuts the shop mid-gate and names itself plus the reason, for the label", () => {
		const shop = shopAsideFor(createMockRunView({ status: "answering" }));

		expect(shop.open).toBe(false);
		expect(shop.hint).toBe("Shop · the shop opens when you clear a gate");
	});

	it("leaves an open shop without a hint, so its own word names it", () => {
		expect(
			shopAsideFor(createMockRunView({ status: "rewarding" })).hint
		).toBeUndefined();
	});

	it("shuts the shop before a run is open", () => {
		expect(shopAsideFor(null).open).toBe(false);
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
