import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ConfigdexPanel } from "~/modules/collection/dex/presentation/ConfigdexPanel.ui";

const sizeHeading = (size: string): HTMLElement => {
	const heading = screen
		.getAllByText(size)
		.find((node) => !node.className.includes("sr-only"));
	if (!heading) throw new Error(`No ${size} heading rendered`);
	return heading;
};

describe(ConfigdexPanel, () => {
	it("shows a grand total and a header per size the roster uses", () => {
		render(<ConfigdexPanel />);
		expect(screen.getByText(/\d+\/\d+ collected/)).toBeInTheDocument();
		expect(sizeHeading("8 slots")).toBeInTheDocument();
		expect(sizeHeading("1 slot")).toBeInTheDocument();
	});

	it("teaches each size with the KB it costs to draft", () => {
		render(<ConfigdexPanel />);
		const header = sizeHeading("8 slots").closest("header");

		expect(header?.textContent).toContain("256 KB");
	});

	it("orders the groups biggest first", () => {
		render(<ConfigdexPanel />);
		const headings = screen
			.getAllByRole("banner")
			.map((header) => header.querySelector("p")?.textContent);

		expect(headings).toEqual(["8 slots", "4 slots", "2 slots", "1 slot"]);
	});

	it("skips a size no config on the roster uses yet", () => {
		render(<ConfigdexPanel />);

		expect(screen.queryByText("12 slots")).not.toBeInTheDocument();
		expect(screen.queryByText("16 slots")).not.toBeInTheDocument();
	});

	it("names no grade, the size being the whole mark", () => {
		render(<ConfigdexPanel />);

		for (const grade of ["bit", "crumb", "nibble", "byte"])
			expect(screen.queryByText(grade)).not.toBeInTheDocument();
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
