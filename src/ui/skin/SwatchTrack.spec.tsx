import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SwatchTrack, type SwatchTrackItem } from "./SwatchTrack.ui";

const items: readonly SwatchTrackItem[] = [
	{
		id: "pallet",
		state: "earned",
		theme: "pallet",
		gate: "gate 1",
		name: "Pallet Swatch",
		earn: "Earned by clearing gate 1",
	},
	{
		id: "cascade",
		state: "locked",
		theme: "cascade",
		gate: "gate 2",
		name: "Cascade Swatch",
		earn: "Clear gate 2 to earn it",
		requirement: "Needs 25% coverage in its window",
	},
];

describe("SwatchTrack", () => {
	it("names each square for a reader who cannot hover", () => {
		render(<SwatchTrack items={items} />);

		expect(
			screen.getByRole("button", {
				name: "gate 2: Cascade Swatch. Clear gate 2 to earn it",
			})
		).toBeInTheDocument();
	});

	it("spells out the prize and its price in the popover", () => {
		render(<SwatchTrack items={items} />);

		expect(screen.getByText("Cascade Swatch")).toBeInTheDocument();
		expect(
			screen.getByText("Needs 25% coverage in its window")
		).toBeInTheDocument();
	});

	it("answers the mouse on a square that cannot be earned yet", () => {
		render(<SwatchTrack items={items} />);

		expect(screen.getByRole("button", { name: /Cascade Swatch/ })).toHaveClass(
			"cursor-not-allowed"
		);
	});

	it("reports a click on a swatch already earned", async () => {
		const onSelect = vi.fn();
		render(<SwatchTrack items={items} onSelect={onSelect} />);

		await userEvent.click(
			screen.getByRole("button", { name: /Pallet Swatch/ })
		);

		expect(onSelect).toHaveBeenCalledWith("pallet");
	});
});
