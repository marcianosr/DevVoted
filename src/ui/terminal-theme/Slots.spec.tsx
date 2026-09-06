import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Slots } from "./Slots.ui";

const barsFor = (slots: number) => {
	const { container } = render(<Slots slots={slots} />);
	return Array.from(container.firstElementChild?.children ?? []);
};

describe("the segmented size mark", () => {
	it("walks one ramp stop per bar at the biggest sizes, and repeats", () => {
		const fills = barsFor(8).map((bar) => bar.className);
		expect(new Set(fills).size).toBe(5);
		expect(fills[0]).toContain("bg-saffron");
		expect(fills[5]).toContain("bg-saffron");
		expect(fills[0]).not.toContain("bg-lavender");
	});

	it("gives every bar one flat fill, never the drifting gradient", () => {
		for (const bar of barsFor(16)) {
			expect(bar.className).not.toContain("legendary-bar");
			expect(bar.getAttribute("style")).toBeNull();
		}
	});

	it("keeps a smaller size on its own rung colour", () => {
		expect(barsFor(2)[0]?.className).toContain("bg-saffron");
		expect(barsFor(2)[0]?.className).not.toContain("legendary-bar");
	});
});

describe("the solid size mark", () => {
	it("keeps the whole ramp in one bar, which is wide enough for it", () => {
		const { container } = render(<Slots slots={16} solid />);
		expect(container.firstElementChild?.className).toContain("legendary-bar");
	});
});
