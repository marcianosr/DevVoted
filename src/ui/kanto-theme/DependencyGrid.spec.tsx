import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DependencyGrid, type DependencyGridProps } from "./DependencyGrid.ui";

const tiles = ["filter", "commit", "margin", "map"].map((label) => ({
	id: label,
	label,
}));

const renderGrid = (overrides: Partial<DependencyGridProps> = {}) => {
	const props: DependencyGridProps = {
		tiles,
		groups: [],
		hints: [null, "Box model"],
		pickedIds: ["commit"],
		onPick: vi.fn(),
		onShuffle: vi.fn(),
		...overrides,
	};
	return { ...render(<DependencyGrid {...props} />), props };
};

describe("DependencyGrid", () => {
	it("marks a picked tile as pressed and the rest as not", () => {
		renderGrid();

		expect(screen.getByRole("button", { name: "commit" })).toHaveAttribute(
			"aria-pressed",
			"true"
		);
		expect(screen.getByRole("button", { name: "filter" })).toHaveAttribute(
			"aria-pressed",
			"false"
		);
	});

	it("hands a pressed tile's id to the screen", async () => {
		const { props } = renderGrid();

		await userEvent.click(screen.getByRole("button", { name: "margin" }));

		expect(props.onPick).toHaveBeenCalledWith("margin");
	});

	it("hides an unnamed group's name and states a named one", () => {
		renderGrid();
		const hints = within(screen.getByRole("list", { name: "groups to find" }));

		expect(hints.getByText("? ???")).toBeInTheDocument();
		expect(hints.getByText("? Box model")).toBeInTheDocument();
	});

	it("shuffles on request", async () => {
		const { props } = renderGrid();

		await userEvent.click(screen.getByRole("button", { name: "shuffle" }));

		expect(props.onShuffle).toHaveBeenCalledOnce();
	});

	it("names a locked-in group with its tiles", () => {
		renderGrid({
			groups: [
				{ label: "Git actions", tiles: ["commit", "rebase"], verdict: "right" },
			],
		});

		expect(screen.getByText("Git actions")).toBeInTheDocument();
		expect(screen.getByText("commit, rebase")).toBeInTheDocument();
	});

	it("offers no press once the grid is over", () => {
		renderGrid({ onPick: undefined, onShuffle: undefined });

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});
