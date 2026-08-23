import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { FAMILY, FAMILY_ORDER, Family } from "./Family.ui";

describe("Family", () => {
	it("names the family the player reads, not the one the roster stores", () => {
		render(<Family family="multiplier" />);

		expect(screen.getByText("multiplier")).toBeInTheDocument();
	});

	it("sets it in caps, so it reads as a tag beside the config's name", () => {
		const { container } = render(<Family family="tool" />);

		expect(container.firstChild).toHaveClass("uppercase");
	});

	it("takes a width from the caller, so a column of rows lines up", () => {
		const { container } = render(<Family family="storage" className="w-20" />);

		expect(container.firstChild).toHaveClass("w-20");
	});

	it("glosses every family, so the legend can never be short one", () => {
		FAMILY_ORDER.forEach((family) =>
			expect(FAMILY[family].gloss.length).toBeGreaterThan(0)
		);
		expect(FAMILY_ORDER).toHaveLength(Object.keys(FAMILY).length);
	});
});
