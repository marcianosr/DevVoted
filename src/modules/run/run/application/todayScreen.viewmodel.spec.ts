import { describe, expect, it } from "vitest";

import { pollsNoteFor } from "~/modules/run/run/application/todayScreen.viewmodel";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";

const today = (pollsLeftToday: number) => ({
	pollsLeftToday,
	pollsPerGate: SLICE_WINDOW,
});

describe(pollsNoteFor, () => {
	it("calls the day ready while every poll of it is still there", () => {
		expect(pollsNoteFor(today(SLICE_WINDOW), undefined)).toBe(
			"today’s 5 polls are ready"
		);
	});

	it("states what is left and that it expires, once the day is part-answered", () => {
		expect(pollsNoteFor(today(3), undefined)).toBe(
			"3 of today’s 5 left · they do not carry to tomorrow"
		);
	});

	it("warns on the last poll of a part-answered day", () => {
		expect(pollsNoteFor(today(1), undefined)).toBe(
			"1 of today’s 5 left · they do not carry to tomorrow"
		);
	});

	it("hands the countdown straight back when the day is spent", () => {
		expect(pollsNoteFor(today(0), "New polls in 7h 23m")).toBe(
			"New polls in 7h 23m"
		);
	});

	// A run abandoned mid-day restarts on today's five minus what the account
	// already answered (ADR-014), so a short segment is a genuinely part-answered
	// day — the player did answer the missing polls, just in the run they left.
	it("reads a restarted run's short segment as a part-answered day", () => {
		expect(pollsNoteFor(today(2), undefined)).toBe(
			"2 of today’s 5 left · they do not carry to tomorrow"
		);
	});

	it("prefers the countdown over the day's own note whenever one is given", () => {
		expect(pollsNoteFor(today(SLICE_WINDOW), "New polls in 1m")).toBe(
			"New polls in 1m"
		);
	});
});
