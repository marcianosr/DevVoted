import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { DexChip } from "./DexChip.ui";

const chipFor = (slots: number) => {
	const { container } = render(
		<DexChip slots={slots} label="config" version={1} maxVersion={5} />
	);
	return container.firstElementChild;
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

describe("DexChip's border", () => {
	it("stays neutral at every size, leaving the hue to the weight block", () => {
		for (const slots of [1, 2, 4]) {
			expect(chipFor(slots)?.className).toContain("border-zinc-700");
			expect(chipFor(slots)?.className).not.toContain("border-celadon");
			expect(chipFor(slots)?.className).not.toContain("border-vermillion");
		}
	});

	it("dashes an unseen chip and lightens a selected one", () => {
		const { container: unseen } = render(<DexChip slots={4} seen={false} />);
		expect(unseen.firstElementChild?.className).toContain("border-dashed");

		const { container: selected } = render(
			<DexChip slots={1} label="config" version={1} maxVersion={5} selected />
		);
		expect(selected.firstElementChild?.className).toContain("border-zinc-300");
	});
});

describe("what a DexChip says about a config", () => {
	it("states the weight as a figure and the version as dots", () => {
		render(<DexChip slots={4} label="Overclock" version={2} maxVersion={5} />);
		expect(screen.getByRole("img", { name: "4 slots" })).toHaveTextContent("4");
		expect(
			screen.getByRole("img", { name: "version 2 of 5" })
		).toBeInTheDocument();
	});

	it("shows the weight of an unseen config and nothing else", () => {
		render(<DexChip slots={2} seen={false} />);
		expect(screen.getByRole("img", { name: "2 slots" })).toBeInTheDocument();
		expect(screen.queryByRole("img", { name: /version/ })).toBeNull();
	});
});
