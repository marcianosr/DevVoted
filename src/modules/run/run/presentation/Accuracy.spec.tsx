import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Accuracy } from "./Accuracy.ui";
import type { AccuracyTrackProps } from "./AccuracyTrack.ui";

const TRACK: AccuracyTrackProps = {
	label: "Accuracy ×1.08",
	figure: "×1.08",
	bonus: 0.32,
	cap: 0.32,
	ticks: [{ share: 0, label: "×1.00" }, { share: 1 }],
};

describe("Accuracy", () => {
	it("heads the bar with its name and no explaining line while the gate is open", () => {
		const { container } = render(<Accuracy track={TRACK} />);

		expect(
			screen.getByRole("heading", { name: "Accuracy" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("img", { name: "Accuracy ×1.08" })
		).toBeInTheDocument();
		expect(container).not.toHaveTextContent("multiplies the bar");
	});

	it("says the multiplier already landed once the gate closed", () => {
		render(<Accuracy track={TRACK} landed />);

		expect(screen.getByText("Streak bonus")).toBeInTheDocument();
	});
});
