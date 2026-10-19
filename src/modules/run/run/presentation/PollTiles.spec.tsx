import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { PollTiles, type PollTilesProps } from "./PollTiles.ui";

const SEALED: PollTilesProps = {
	title: "The five polls",
	state: "sealed",
	tiles: Array.from({ length: 5 }, () => ({ locked: true })),
};

const REVEALED: PollTilesProps = {
	title: "The five polls",
	state: "revealed by Prefetch",
	tiles: [
		{ category: "Git", shape: "single · 4 options" },
		{ category: "Git" },
	],
	after: [{ label: "next gate", figures: [{ label: "JavaScript ×5" }] }],
};

describe("PollTiles", () => {
	it("draws one dashed tile per poll, in order", () => {
		render(<PollTiles {...SEALED} />);

		const tiles = within(screen.getByRole("list")).getAllByRole("listitem");

		expect(tiles).toHaveLength(5);
		expect(tiles[0]).toHaveClass("border-dashed", "seal-wiggle");
	});

	it("hides a sealed tile's question mark from a reader and names it instead", () => {
		render(<PollTiles {...SEALED} />);

		expect(screen.getAllByText("?")[0]).toHaveAttribute("aria-hidden");
		expect(screen.getAllByText("Sealed poll")).toHaveLength(5);
	});

	it("badges its state in the header", () => {
		render(<PollTiles {...REVEALED} />);

		expect(
			within(screen.getByRole("banner")).getByText("revealed by Prefetch")
		).toHaveClass("badge-theme");
	});

	it("states a revealed tile's category, and its shape only when known", () => {
		render(<PollTiles {...REVEALED} />);

		const [first, second] = within(screen.getByRole("list")).getAllByRole(
			"listitem"
		);

		expect(first).toHaveTextContent("Gitsingle · 4 options");
		expect(second).toHaveTextContent(/^Git$/);
	});

	it("rows the next gate under the tiles", () => {
		render(<PollTiles {...REVEALED} />);

		expect(screen.getByText("next gate")).toBeInTheDocument();
		expect(screen.getByText("JavaScript ×5")).toBeInTheDocument();
	});
});
