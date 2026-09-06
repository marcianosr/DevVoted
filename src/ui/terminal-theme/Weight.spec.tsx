import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Weight } from "./Weight.ui";

const edgeFor = (slots: number) => {
	const { container } = render(<Weight slots={slots} />);
	return container.firstElementChild?.firstElementChild?.className ?? "";
};

describe("the weight block", () => {
	it("states the slot count as a figure rather than one mark per slot", () => {
		render(<Weight slots={16} />);
		expect(screen.getByRole("img", { name: "16 slots" })).toHaveTextContent(
			"16"
		);
	});

	it("reads a one-slot config in the singular", () => {
		render(<Weight slots={1} />);
		expect(screen.getByRole("img", { name: "1 slot" })).toBeInTheDocument();
	});

	it("carries the size hue on its edge, so the block reads without a border", () => {
		expect(edgeFor(1)).toContain("bg-celadon");
		expect(edgeFor(2)).toContain("bg-saffron");
		expect(edgeFor(4)).toContain("bg-vermillion");
	});

	it("hands the edge to the drifting gradient from the prismatic rungs up", () => {
		expect(edgeFor(4)).not.toContain("legendary-bar");
		for (const slots of [8, 12, 16])
			expect(edgeFor(slots)).toContain("legendary-bar");
	});
});
