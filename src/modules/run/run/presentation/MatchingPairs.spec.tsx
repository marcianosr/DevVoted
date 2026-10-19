import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
	MatchingPairs,
	type MatchingPairsProps,
	type PairTile,
} from "./MatchingPairs.ui";

const tile = (label: string): PairTile => ({ id: label, label });

const LEFT = ["div + div", "div > div"].map(tile);
const RIGHT = ["the next sibling", "a direct child"].map(tile);

const renderPairs = (overrides: Partial<MatchingPairsProps> = {}) => {
	const props: MatchingPairsProps = {
		left: LEFT,
		right: RIGHT,
		onPick: vi.fn(),
		onClear: vi.fn(),
		...overrides,
	};
	return { ...render(<MatchingPairs {...props} />), props };
};

const keycapOf = (label: string) =>
	screen.getByText(label).closest("[data-tile]")?.querySelector("[data-cap]")
		?.textContent;

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

	it("numbers the left tiles and letters the right tiles while nothing is linked", () => {
		renderPairs();

		expect(keycapOf("div + div")).toBe("1");
		expect(keycapOf("div > div")).toBe("2");
		expect(keycapOf("the next sibling")).toBe("A");
		expect(keycapOf("a direct child")).toBe("B");
	});

	it("gives a linked right tile the number of the left tile it is linked to", () => {
		renderPairs({ links: [{ left: "div > div", right: "the next sibling" }] });

		expect(keycapOf("the next sibling")).toBe("2");
		expect(keycapOf("a direct child")).toBe("B");
	});

	it("draws one line per link in the left tile's colour", () => {
		const { container } = renderPairs({
			links: [
				{ left: "div + div", right: "a direct child" },
				{ left: "div > div", right: "the next sibling" },
			],
		});

		const lines = [...container.querySelectorAll("[data-link]")];
		expect(lines).toHaveLength(2);
		expect(lines[0].getAttribute("data-screen-theme")).not.toBe(
			lines[1].getAttribute("data-screen-theme")
		);
	});

	it("marks the tile waiting for its partner as pressed and the rest as not", () => {
		renderPairs({ pendingId: "div + div" });

		expect(screen.getByRole("button", { name: "div + div" })).toHaveAttribute(
			"aria-pressed",
			"true"
		);
		expect(
			screen.getByRole("button", { name: "the next sibling" })
		).toHaveAttribute("aria-pressed", "false");
	});

	it("keeps a linked tile pressable so its link can be redrawn", async () => {
		const { props } = renderPairs({
			links: [{ left: "div + div", right: "the next sibling" }],
		});

		await userEvent.click(
			screen.getByRole("button", { name: "the next sibling" })
		);

		expect(props.onPick).toHaveBeenCalledWith("the next sibling");
	});

	it("draws a matched tile green and a missed tile red, neither pressable", () => {
		renderPairs({
			left: [{ ...LEFT[0], verdict: "matched" }],
			right: [{ ...RIGHT[0], verdict: "missed" }],
			onPick: undefined,
		});

		expect(
			screen.getByText("div + div").closest("[data-tile]")
		).toHaveAttribute("data-screen-theme", "viridian");
		expect(
			screen.getByText("the next sibling").closest("[data-tile]")
		).toHaveAttribute("data-screen-theme", "cinnabar");
		expect(screen.queryAllByRole("button")).toHaveLength(0);
	});

	it("clears every link from the clear press", async () => {
		const { props } = renderPairs({
			links: [{ left: "div + div", right: "the next sibling" }],
		});

		await userEvent.click(screen.getByRole("button", { name: "clear" }));

		expect(props.onClear).toHaveBeenCalled();
	});

	it("offers no clear press while nothing is linked", () => {
		renderPairs();

		expect(screen.queryByRole("button", { name: "clear" })).toBeNull();
	});

	it("draws the tiles as plain text when nobody can pick", () => {
		renderPairs({ onPick: undefined });

		expect(screen.queryAllByRole("button")).toHaveLength(0);
		expect(screen.getByText("div + div")).toBeInTheDocument();
	});

	it("draws a backticked part of a tile as code", () => {
		renderPairs({ left: [tile("`div + p`")], right: [tile("the `p` after")] });

		expect(screen.getByText("div + p").tagName).toBe("CODE");
		expect(screen.getByText("p").tagName).toBe("CODE");
	});

	it("marks a right link with a tick and a wrong one with a cross, dashing the wrong line", () => {
		const { container } = renderPairs({
			links: [
				{ left: "div + div", right: "a direct child", verdict: "missed" },
				{ left: "div > div", right: "the next sibling", verdict: "matched" },
			],
			onPick: undefined,
		});

		expect(
			screen.getByText("a direct child").closest("[data-tile]")
		).toHaveTextContent("✗");
		expect(
			screen.getByText("the next sibling").closest("[data-tile]")
		).toHaveTextContent("✓");
		const lines = [...container.querySelectorAll("[data-link]")];
		expect(lines[0]).toHaveAttribute("stroke-dasharray");
		expect(lines[1]).not.toHaveAttribute("stroke-dasharray");
	});

	it("keeps each link's own colour while it carries a verdict", () => {
		const { container } = renderPairs({
			links: [
				{ left: "div + div", right: "a direct child", verdict: "missed" },
				{ left: "div > div", right: "the next sibling", verdict: "missed" },
			],
			onPick: undefined,
		});

		const [first, second] = [...container.querySelectorAll("[data-link]")];
		expect(first.getAttribute("data-screen-theme")).not.toBe(
			second.getAttribute("data-screen-theme")
		);
	});

	it("offers a shut Check pairs press while the board has no check to run", () => {
		renderPairs();

		expect(screen.getByRole("button", { name: "Check pairs" })).toBeDisabled();
	});

	it("runs the check from the Check pairs press", async () => {
		const onCheck = vi.fn();
		renderPairs({ onCheck });

		await userEvent.click(screen.getByRole("button", { name: "Check pairs" }));

		expect(onCheck).toHaveBeenCalled();
	});

	it("offers no Check pairs press once nobody can pick", () => {
		renderPairs({ onPick: undefined });

		expect(screen.queryByRole("button", { name: "Check pairs" })).toBeNull();
	});
});
