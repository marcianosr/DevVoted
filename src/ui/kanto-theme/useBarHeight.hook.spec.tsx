import { describe, expect, it, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { stubResizeObserver } from "~/test/resizeObserver.harness";

import { useBarHeight } from "./useBarHeight.hook";

const UNMEASURED = "unmeasured";

const Bar = ({ mounted = true }: { mounted?: boolean }) => {
	const [measure, height] = useBarHeight();

	return (
		<>
			<span data-testid="reading">{height ?? UNMEASURED}</span>
			{mounted ? <footer ref={measure}>build</footer> : null}
		</>
	);
};

const reading = () => screen.getByTestId("reading").textContent;

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("useBarHeight", () => {
	it("reports nothing until the bar has been measured", () => {
		stubResizeObserver();
		render(<Bar />);

		expect(reading()).toBe(UNMEASURED);
	});

	it("reports the bar's height once the observer has read it", () => {
		const observer = stubResizeObserver();
		render(<Bar />);

		observer.resizeTo(64);

		expect(reading()).toBe("64");
	});

	it("measures the border box, so a bar's padding counts as space it takes", () => {
		const observer = stubResizeObserver();
		render(<Bar />);

		expect(observer.observedWith()).toEqual({ box: "border-box" });
	});

	it("rounds a fractional box up, so what stacks on it clears rather than overlaps", () => {
		const observer = stubResizeObserver();
		render(<Bar />);

		observer.resizeTo(63.2);

		expect(reading()).toBe("64");
	});

	it("follows the bar when it grows, which is what a fold opening looks like", () => {
		const observer = stubResizeObserver();
		render(<Bar />);

		observer.resizeTo(64);
		observer.resizeTo(312);

		expect(reading()).toBe("312");
	});

	it("measures nothing while there is no bar to measure", () => {
		const observer = stubResizeObserver();
		render(<Bar mounted={false} />);

		expect(observer.observing()).toBe(false);
		expect(reading()).toBe(UNMEASURED);
	});

	it("takes up the bar when one arrives, rather than watching the first pass forever", () => {
		const observer = stubResizeObserver();
		const { rerender } = render(<Bar mounted={false} />);

		rerender(<Bar mounted />);
		observer.resizeTo(64);

		expect(reading()).toBe("64");
	});

	it("lets the bar go when the screen does", () => {
		const observer = stubResizeObserver();
		const { unmount } = render(<Bar />);

		unmount();

		expect(observer.disconnected()).toBe(true);
	});
});
