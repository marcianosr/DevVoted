import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
	MatchingPairs,
	type MatchingPairsProps,
	type PairTile,
} from "./MatchingPairs.ui";

const open = (label: string): PairTile => ({ id: label, label, state: "open" });

const renderPairs = (overrides: Partial<MatchingPairsProps> = {}) => {
	const props: MatchingPairsProps = {
		left: [open("div + div"), { ...open("div > div"), state: "matched" }],
		right: [
			open("the next sibling"),
			{ ...open("a direct child"), state: "matched" },
		],
		pickedIds: ["div + div"],
		onPick: vi.fn(),
		...overrides,
	};
	return { ...render(<MatchingPairs {...props} />), props };
};

describe("MatchingPairs", () => {
	it("lays the left and right tiles out in two columns", () => {
		renderPairs();

		expect(
			within(screen.getByRole("group", { name: "left tiles" })).getByText(
				"div + div"
			)
		).toBeInTheDocument();
		expect(
			within(screen.getByRole("group", { name: "right tiles" })).getByText(
				"the next sibling"
			)
		).toBeInTheDocument();
	});

	it("marks the picked tile as pressed and an open one as not", () => {
		renderPairs();

		expect(screen.getByRole("button", { name: "div + div" })).toHaveAttribute(
			"aria-pressed",
			"true"
		);
		expect(
			screen.getByRole("button", { name: "the next sibling" })
		).toHaveAttribute("aria-pressed", "false");
	});

	it("hands a pressed tile's id to the screen", async () => {
		const { props } = renderPairs();

		await userEvent.click(
			screen.getByRole("button", { name: "the next sibling" })
		);

		expect(props.onPick).toHaveBeenCalledWith("the next sibling");
	});

	it("draws a matched pair green and no longer pressable", () => {
		renderPairs();

		const tile = screen.getByText("div > div").closest("[data-pair]");
		expect(tile).toHaveAttribute("data-screen-theme", "viridian");
		expect(screen.queryByRole("button", { name: "div > div" })).toBeNull();
	});

	it("draws a missed pair red and no longer pressable", () => {
		renderPairs({
			left: [{ ...open("div ~ div"), state: "missed" }],
			right: [{ ...open("any later sibling"), state: "missed" }],
		});

		expect(
			screen.getByText("any later sibling").closest("[data-pair]")
		).toHaveAttribute("data-screen-theme", "cinnabar");
		expect(screen.queryAllByRole("button")).toHaveLength(0);
	});

	it("draws open tiles as plain text once the poll is answered", () => {
		renderPairs({ onPick: undefined });

		expect(screen.queryAllByRole("button")).toHaveLength(0);
		expect(screen.getByText("div + div")).toBeInTheDocument();
	});

	it("draws a backticked part of a tile as code", () => {
		renderPairs({ left: [open("`div + p`")], right: [open("the `p` after")] });

		expect(screen.getByText("div + p").tagName).toBe("CODE");
		expect(screen.getByText("p").tagName).toBe("CODE");
	});

	it("joins each left tile to the right tile beside it when the pairs are linked", () => {
		renderPairs({ linked: true, onPick: undefined });

		const rows = within(
			screen.getByRole("list", { name: "pairs" })
		).getAllByRole("listitem");
		expect(rows).toHaveLength(2);
		expect(within(rows[0]).getByText("div + div")).toBeInTheDocument();
		expect(within(rows[0]).getByText("the next sibling")).toBeInTheDocument();
		expect(within(rows[1]).getByText("div > div")).toBeInTheDocument();
		expect(within(rows[1]).getByText("a direct child")).toBeInTheDocument();
	});
});
