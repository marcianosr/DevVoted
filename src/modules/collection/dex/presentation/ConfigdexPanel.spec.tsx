import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ConfigdexPanel } from "~/modules/collection/dex/presentation/ConfigdexPanel.ui";

const gradeHeading = (grade: string): HTMLElement => {
	const heading = screen
		.getAllByText(grade)
		.find((node) => !node.className.includes("sr-only"));
	if (!heading) throw new Error(`No ${grade} heading rendered`);
	return heading;
};

describe(ConfigdexPanel, () => {
	it("shows a grand total and a header per grade", () => {
		render(<ConfigdexPanel />);
		expect(screen.getByText(/\d+\/\d+ collected/)).toBeInTheDocument();
		expect(gradeHeading("byte")).toBeInTheDocument();
		expect(gradeHeading("bit")).toBeInTheDocument();
	});

	it("teaches each grade with its glyph, its odds and its size", () => {
		render(<ConfigdexPanel />);
		const header = gradeHeading("byte").closest("header");

		expect(header?.querySelectorAll("svg rect")).toHaveLength(8);
		expect(header?.textContent).toContain("1 in 33");
		expect(header?.textContent).toContain("8 spots");
	});

	it("orders the groups rarest first", () => {
		render(<ConfigdexPanel />);
		const headings = screen
			.getAllByRole("banner")
			.map((header) => header.querySelector("p")?.textContent);

		expect(headings).toEqual(["byte", "nibble", "crumb", "bit"]);
	});

	it("keys the grade in no colour, the cells being the whole mark", () => {
		render(<ConfigdexPanel />);

		expect(gradeHeading("byte").className).not.toMatch(
			/cerulean|viridian|cinnabar|legendary/
		);
	});

	it("lists a config as a bare chip, with its effect in the chip's tooltip", () => {
		render(<ConfigdexPanel />);
		expect(screen.getByText("AGENTS.md")).toBeInTheDocument();
		const tooltips = screen.getAllByRole("tooltip");
		expect(
			tooltips.some((node) =>
				node.textContent?.includes("All coverage earns ×2")
			)
		).toBe(true);
	});
});
