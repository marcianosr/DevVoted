import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEMO_BEATS } from "~/modules/account/auth/application/loginDemo.viewmodel";
import { useLoginDemo } from "~/modules/account/auth/presentation/useLoginDemo.hook";

describe("useLoginDemo", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("opens on the first poll before anything is picked", () => {
		const { result } = renderHook(() => useLoginDemo());

		expect(result.current).toEqual({ poll: 0, phase: "enter" });
	});

	it("picks after the pick beat, leaves after the hold and moves to the next poll", () => {
		const { result } = renderHook(() => useLoginDemo());

		act(() => {
			vi.advanceTimersByTime(DEMO_BEATS.pickAt);
		});
		expect(result.current).toEqual({ poll: 0, phase: "picked" });

		act(() => {
			vi.advanceTimersByTime(DEMO_BEATS.holdMs);
		});
		expect(result.current).toEqual({ poll: 0, phase: "leaving" });

		act(() => {
			vi.advanceTimersByTime(DEMO_BEATS.leaveMs);
		});
		expect(result.current).toEqual({ poll: 1, phase: "enter" });
	});

	it("stops its timer when the screen unmounts", () => {
		const { unmount } = renderHook(() => useLoginDemo());

		unmount();

		expect(vi.getTimerCount()).toBe(0);
	});
});
