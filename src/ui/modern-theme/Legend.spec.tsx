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
