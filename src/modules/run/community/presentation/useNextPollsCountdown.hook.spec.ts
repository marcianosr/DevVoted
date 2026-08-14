import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useNextPollsCountdown } from "~/modules/run/community/presentation/useNextPollsCountdown.hook";

describe("useNextPollsCountdown", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		// 16:30 local — 7h 30m short of the midnight rollover.
		vi.setSystemTime(new Date(2026, 7, 4, 16, 30, 0));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("opens with the time left until the local day rolls over", () => {
		const { result } = renderHook(() => useNextPollsCountdown());
		expect(result.current.isOpen).toBe(false);
		expect(result.current.label).toBe("New polls in 7h 30m");
	});

	it("ticks the label down as the evening passes", () => {
		const { result } = renderHook(() => useNextPollsCountdown());
		act(() => {
			vi.advanceTimersByTime(31 * 60_000);
		});
		expect(result.current.label).toBe("New polls in 6h 59m");
	});

	it("flips open once midnight passes", () => {
		const { result } = renderHook(() => useNextPollsCountdown());
		act(() => {
			vi.advanceTimersByTime(7 * 3_600_000 + 30 * 60_000);
		});
		expect(result.current.isOpen).toBe(true);
	});

	// Regression: the deadline is pinned at mount. Recomputing "next midnight"
	// per tick would read ~24h the moment the day rolls over and never open.
	it("stays open while the player lingers past midnight", () => {
		const { result } = renderHook(() => useNextPollsCountdown());
		act(() => {
			vi.advanceTimersByTime(9 * 3_600_000);
		});
		expect(result.current.isOpen).toBe(true);
	});
});
