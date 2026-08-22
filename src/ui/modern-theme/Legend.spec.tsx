import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Legend } from "./Legend.ui";

describe("Legend", () => {
	it("names every tier a config can be", () => {
		render(<Legend />);

		expect(screen.getAllByRole("listitem")).toHaveLength(4);
	});

	it("lists the tiers cheapest first", () => {
		render(<Legend />);

		expect(
			screen.getAllByRole("listitem").map((item) => item.textContent)
		).toEqual(["common", "uncommon", "rare", "legendary"]);
	});
});
