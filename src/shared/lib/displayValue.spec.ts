import { describe, expect, it } from "vitest";

import {
	count,
	duration,
	formatCount,
	formatDuration,
	formatKbGain,
	formatPercent,
	kb,
	percent,
} from "~/shared/lib/displayValue";

describe("formatPercent", () => {
	it("signs a gain so a column of them reads as movement", () => {
		expect(formatPercent(percent(3.9))).toBe("+3.9%");
	});

	// The awards panel used an always-"+" template, which would have rendered
	// "+-1.2%" the first time an award went negative.
	it("leaves a loss its own minus rather than adding a second sign", () => {
		expect(formatPercent(percent(-1.2))).toBe("-1.2%");
	});

	it("signs zero as a gain, since nothing was lost", () => {
		expect(formatPercent(percent(0))).toBe("+0%");
	});
});

describe("formatKbGain", () => {
	it("shows a small payout in KB", () => {
		expect(formatKbGain(kb(32))).toBe("+32KB");
	});

	// The gate report hand-rolled `+${n}KB`, so a four-figure payout read
	// "+2048KB" there while the shop's formatKb read "2MB" for the same number.
	it("rolls a four-figure payout over to MB, as the shop already did", () => {
		expect(formatKbGain(kb(2048))).toBe("+2MB");
	});

	it("keeps one decimal on an uneven MB", () => {
		expect(formatKbGain(kb(1536))).toBe("+1.5MB");
	});
});

describe("formatDuration", () => {
	it("reads seconds under a minute", () => {
		expect(formatDuration(duration(9_000))).toBe("9s");
	});

	it("pads the seconds once it passes a minute", () => {
		expect(formatDuration(duration(105_000))).toBe("1m45");
	});
});

describe("formatCount", () => {
	it("shows a bare number, with no unit to read past", () => {
		expect(formatCount(count(14))).toBe("14");
	});
});
