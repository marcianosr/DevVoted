import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Dot } from "./Dot.ui";
import { Legend, RARITY_LEGEND } from "./Legend.ui";

describe("Legend", () => {
	it("names every tier a config can be", () => {
		render(<Legend items={RARITY_LEGEND} />);

		expect(screen.getAllByRole("listitem")).toHaveLength(4);
	});

	it("lists the tiers cheapest first", () => {
		render(<Legend items={RARITY_LEGEND} />);

		expect(
			screen.getAllByRole("listitem").map((item) => item.textContent)
		).toEqual(["common", "uncommon", "rare", "legendary"]);
	});

	it("sets each tier's name in that tier's own colour", () => {
		render(<Legend items={RARITY_LEGEND} />);

		expect(screen.getByText("common")).toHaveClass("text-cerulean");
		expect(screen.getByText("uncommon")).toHaveClass("text-viridian");
		expect(screen.getByText("rare")).toHaveClass("text-cinnabar");
		expect(screen.getByText("legendary")).toHaveClass("text-legendary");
	});

	it("leaves a label with no colour of its own uncoloured", () => {
		render(<Legend items={[{ id: "audit", label: "audit" }]} />);

		expect(screen.getByText("audit")).not.toHaveAttribute("class");
	});

	it("keys a column with its name alone, since a column has no swatch", () => {
		render(
			<Legend
				items={[
					{ id: "coverage", label: "coverage needed" },
					{
						id: "audit",
						marker: <Dot shape="box" tone="saffron" />,
						label: "audit",
					},
				]}
			/>
		);
		const [column, chip] = screen.getAllByRole("listitem");

		expect(column.querySelector("span[aria-hidden]")).toBeNull();
		expect(chip.querySelector("span[aria-hidden]")).not.toBeNull();
	});
});
