import { describe, expect, it } from "vitest";

import { formatDurationMs } from "./dateUtils";

describe("formatDurationMs", () => {
	it("reads sub-minute durations as bare seconds", () => {
		expect(formatDurationMs(9_000)).toBe("9s");
		expect(formatDurationMs(59_400)).toBe("59s");
	});

	it("never reads zero — the floor is 1s", () => {
		expect(formatDurationMs(0)).toBe("1s");
		expect(formatDurationMs(300)).toBe("1s");
	});

	it("switches to compact m/ss past a minute, zero-padding seconds", () => {
		expect(formatDurationMs(60_000)).toBe("1m00");
		expect(formatDurationMs(105_000)).toBe("1m45");
		expect(formatDurationMs(605_000)).toBe("10m05");
	});

	it("rounds half-seconds to the nearest whole second", () => {
		expect(formatDurationMs(8_499)).toBe("8s");
		expect(formatDurationMs(8_500)).toBe("9s");
	});
});
