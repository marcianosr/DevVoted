import { describe, expect, it } from "vitest";

import { pollsNoteFor } from "~/modules/run/run/application/todayScreen.viewmodel";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";

const today = (pollsLeftToday: number) => ({
	pollsLeftToday,
	pollsPerGate: SLICE_WINDOW,
});

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
