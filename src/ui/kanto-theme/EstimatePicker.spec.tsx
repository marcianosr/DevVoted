import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EstimatePicker, type EstimateCard } from "./EstimatePicker.ui";

const CARDS: readonly EstimateCard[] = [
	{ count: 1, floor: "at least 1 of 5", payout: "+5%" },
	{ count: 3, floor: "at least 3 of 5", payout: "+15%" },
	{ count: 5, floor: "at least 5 of 5", payout: "+25%" },
];

const props = {
	label: "Planning Poker",
	hint: "Call how many of the five you will get right.",
	cards: CARDS,
	committed: null,
};

describe("EstimatePicker", () => {
	it("names every card by its floor and what meeting it pays", () => {
		render(<EstimatePicker {...props} onPick={() => {}} />);

		expect(screen.getByText("at least 3 of 5")).toBeInTheDocument();
		expect(screen.getByText("+15%")).toBeInTheDocument();
	});

	it("sends the count the player pressed", async () => {
		const onPick = vi.fn();
		render(<EstimatePicker {...props} onPick={onPick} />);

		await userEvent.click(screen.getByRole("button", { name: "3" }));

		expect(onPick).toHaveBeenCalledWith(3);
	});

	it("arms the committed card and leaves the others unpressed", () => {
		render(<EstimatePicker {...props} committed={3} onPick={() => {}} />);

		expect(screen.getByRole("button", { name: "3" })).toHaveAttribute(
			"aria-pressed",
			"true"
		);
		expect(screen.getByRole("button", { name: "1" })).toHaveAttribute(
			"aria-pressed",
			"false"
		);
	});

	it("offers no press at all once the bet is locked", () => {
		render(<EstimatePicker {...props} committed={3} />);

		expect(screen.queryByRole("button")).toBeNull();
	});

	it("shows the refusal as visible text, not as a label only a reader hears", () => {
		const refusal = "The gate has started — the bet is locked.";
		render(<EstimatePicker {...props} refusal={refusal} />);

		expect(screen.getByText(refusal)).toBeInTheDocument();
	});
});
