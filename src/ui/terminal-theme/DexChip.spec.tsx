import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { DexChip } from "./DexChip.ui";
import { Slots } from "./Slots.ui";

const chipFor = (slots: number) => {
	const { container } = render(
		<DexChip slots={slots} label="config" version={1} />
	);
	return container.firstElementChild;
};

const barsFor = (slots: number) => {
	const { container } = render(<Slots slots={slots} />);
	return Array.from(container.firstElementChild?.children ?? []);
};

describe("DexChip's prismatic ladder", () => {
	it("rings the biggest sizes, which a build is built around", () => {
		for (const slots of [8, 12, 16])
			expect(chipFor(slots)?.className).toContain("legendary-ring-flow");
	});

	it("leaves every smaller size on a flat border", () => {
		for (const slots of [1, 2, 4])
			expect(chipFor(slots)?.className).not.toContain("legendary-ring");
	});

	it("adds the wash at 12 and the quicker drift at 16, keeping the ring", () => {
		expect(chipFor(8)?.className).not.toContain("legendary-shimmer");
		expect(chipFor(12)?.className).toContain("legendary-shimmer");
		expect(chipFor(12)?.className).not.toContain("legendary-quick");
		expect(chipFor(16)?.className).toContain("legendary-shimmer");
		expect(chipFor(16)?.className).toContain("legendary-quick");
	});

	it("keeps the ring off an unseen chip, whatever its size", () => {
		const { container } = render(<DexChip slots={16} seen={false} />);
		expect(container.firstElementChild?.className).not.toContain(
			"legendary-ring"
		);
		expect(screen.getByText("???")).toBeInTheDocument();
	});
});

describe("the size mark", () => {
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

	it("keeps the whole ramp in a solid mark, which is wide enough for it", () => {
		const { container } = render(<Slots slots={16} solid />);
		expect(container.firstElementChild?.className).toContain("legendary-bar");
	});

	it("keeps a smaller size on its own rung colour", () => {
		expect(barsFor(2)[0]?.className).toContain("bg-saffron");
		expect(barsFor(2)[0]?.className).not.toContain("legendary-bar");
	});
});
