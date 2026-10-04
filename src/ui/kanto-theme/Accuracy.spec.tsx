import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Accuracy } from "./Accuracy.ui";

const TRACK = {
	label: "Accuracy ×1.08",
	figure: "×1.08",
	sure: 0.08,
	best: 0.08,
};

describe("Accuracy", () => {
	it("says the multiplier is still ahead while the gate is open", () => {
		render(<Accuracy track={TRACK} />);

		expect(
			screen.getByText("multiplies the bar when the gate closes")
		).toBeInTheDocument();
		expect(
			screen.getByRole("img", { name: "Accuracy ×1.08" })
		).toBeInTheDocument();
	});

	it("says the multiplier already landed once the gate closed", () => {
		render(<Accuracy track={TRACK} landed />);

		expect(screen.getByText("Streak bonus")).toBeInTheDocument();
	});
});
