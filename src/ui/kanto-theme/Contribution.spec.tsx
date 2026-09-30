import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Contribution } from "./Contribution.ui";

describe("Contribution", () => {
	it("leads with the role, then the polls published and the answers they drew", () => {
		render(<Contribution role="Poll editor" published={12} answers={1842} />);

		expect(
			screen.getByText("Poll editor · 12 polls published · 1,842 answers")
		).toBeInTheDocument();
	});

	it("drops the role for an author who holds none", () => {
		render(<Contribution published={3} answers={40} />);

		expect(
			screen.getByText("3 polls published · 40 answers")
		).toBeInTheDocument();
	});

	it("speaks of one poll and one answer in the singular", () => {
		render(<Contribution published={1} answers={1} />);

		expect(screen.getByText("1 poll published · 1 answer")).toBeInTheDocument();
	});
});
