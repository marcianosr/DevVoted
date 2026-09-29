import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useNextPollsCountdown } from "~/shared/hooks/useNextPollsCountdown.hook";

describe("useNextPollsCountdown", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 7, 4, 16, 30, 0));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("opens with the time left until the local day rolls over", () => {
		const { result } = renderHook(() => useNextPollsCountdown());
		expect(result.current.isOpen).toBe(false);
		expect(result.current.remaining).toBe("7h 30m");
	});

	it("ticks the remaining time down as the evening passes", () => {
		const { result } = renderHook(() => useNextPollsCountdown());
		act(() => {
			vi.advanceTimersByTime(31 * 60_000);
		});
		expect(result.current.remaining).toBe("6h 59m");
	});

	it("states the bare duration, leaving each surface to phrase it", () => {
		const { result } = renderHook(() => useNextPollsCountdown());
		expect(result.current.remaining).not.toContain("New polls");
	});

	it("flips open once midnight passes", () => {
		const { result } = renderHook(() => useNextPollsCountdown());
		act(() => {
			vi.advanceTimersByTime(7 * 3_600_000 + 30 * 60_000);
		});
		expect(result.current.isOpen).toBe(true);
	});

	it("stays open while the player lingers past midnight", () => {
		const { result } = renderHook(() => useNextPollsCountdown());
		act(() => {
			vi.advanceTimersByTime(9 * 3_600_000);
		});
		expect(result.current.isOpen).toBe(true);
	});
});
