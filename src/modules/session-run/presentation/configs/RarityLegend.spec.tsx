import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { RarityLegend } from "./RarityLegend.ui";

describe("RarityLegend", () => {
	it("lists every rarity tier", () => {
		render(<RarityLegend />);
		for (const tier of ["common", "uncommon", "rare", "legendary"]) {
			expect(screen.getByText(tier)).toBeInTheDocument();
		}
	});
});
