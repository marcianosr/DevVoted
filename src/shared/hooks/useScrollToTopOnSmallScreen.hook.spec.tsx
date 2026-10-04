import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useScrollToTopOnSmallScreen } from "~/shared/hooks/useScrollToTopOnSmallScreen.hook";

const onAScreen = (small: boolean) =>
	vi.stubGlobal("matchMedia", (query: string) => ({
		matches: small,
		media: query,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
	}));

describe("useScrollToTopOnSmallScreen", () => {
	afterEach(() => vi.unstubAllGlobals());

	it("scrolls to the top on a small screen each time the screen changes", () => {
		onAScreen(true);
		const scrollTo = vi.fn();
		vi.stubGlobal("scrollTo", scrollTo);

		const { rerender } = renderHook(
			({ key }) => useScrollToTopOnSmallScreen(key),
			{ initialProps: { key: "poll-1" } }
		);
		rerender({ key: "poll-1" });
		rerender({ key: "poll-2" });

		expect(scrollTo).toHaveBeenCalledTimes(2);
		expect(scrollTo).toHaveBeenLastCalledWith({ top: 0 });
	});

	it("leaves the scroll alone on a wide screen", () => {
		onAScreen(false);
		const scrollTo = vi.fn();
		vi.stubGlobal("scrollTo", scrollTo);

		const { rerender } = renderHook(
			({ key }) => useScrollToTopOnSmallScreen(key),
			{ initialProps: { key: "poll-1" } }
		);
		rerender({ key: "poll-2" });

		expect(scrollTo).not.toHaveBeenCalled();
	});
});
