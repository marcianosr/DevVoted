import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	PollsPanel,
	type DexPoll,
	type PollsPanelProps,
} from "./PollsPanel.ui";

const MASTERED: DexPoll = {
	id: "0187",
	number: 187,
	seen: true,
	question: "Which array method returns a shallow copy?",
	category: "javascript",
	timesSeen: 2,
	accuracy: 100,
};

const SHAKY: DexPoll = {
	id: "0233",
	number: 233,
	seen: true,
	question: "Select every property that creates a stacking context",
	category: "css",
	timesSeen: 4,
	accuracy: 50,
};

const FUMBLED: DexPoll = {
	id: "0301",
	number: 301,
	seen: true,
	question: "Which Python built-in returns an iterator of tuples?",
	category: "python",
	timesSeen: 1,
	accuracy: 0,
};

const props = (over: Partial<PollsPanelProps> = {}): PollsPanelProps => ({
	filters: [{ id: "seen", label: "seen", count: "23" }],
	activeFilter: "seen",
	onFilter: () => {},
	categories: [{ id: "any", label: "any category" }],
	category: "any",
	onCategory: () => {},
	polls: [MASTERED],
	...over,
});

describe("PollsPanel", () => {
	it("pads the dex number, so the column stays a column", () => {
		render(<PollsPanel {...props()} />);

		expect(screen.getByText("#0187")).toBeInTheDocument();
	});

	it("colours accuracy by the game's own thresholds", () => {
		render(<PollsPanel {...props({ polls: [MASTERED, SHAKY, FUMBLED] })} />);

		expect(screen.getByText("100%")).toHaveClass("text-celadon");
		expect(screen.getByText("50%")).toHaveClass("text-saffron");
		expect(screen.getByText("0%")).toHaveClass("text-cinnabar");
	});

	it("dashes a poll served but never answered, rather than calling it zero", () => {
		render(
			<PollsPanel {...props({ polls: [{ ...MASTERED, accuracy: null }] })} />
		);

		expect(screen.getByText("—")).toBeInTheDocument();
		expect(screen.queryByText("0%")).toBeNull();
	});

	it("redacts a poll you have not met, question and category both", () => {
		render(
			<PollsPanel
				{...props({ polls: [{ id: "0002", number: 2, seen: false }] })}
			/>
		);
		const row = within(screen.getByRole("table")).getAllByRole("row")[1];

		expect(within(row).getAllByText("???")).toHaveLength(4);
		expect(within(row).getByText("#0002")).toBeInTheDocument();
	});

	it("names its columns, so a reader knows what each cell is", () => {
		render(<PollsPanel {...props()} />);

		expect(
			screen.getAllByRole("columnheader").map((cell) => cell.textContent)
		).toEqual(["ID", "Question", "Category", "Seen", "Accuracy"]);
	});

	it("offers to reveal what it is withholding, and says how much", async () => {
		const onToggle = vi.fn();
		render(
			<PollsPanel
				{...props({ unmet: { count: 395, shown: false, onToggle } })}
			/>
		);

		expect(
			screen.getByText("395 polls you haven't met yet")
		).toBeInTheDocument();
		await userEvent.click(screen.getByRole("button", { name: "show as ???" }));

		expect(onToggle).toHaveBeenCalled();
	});

	it("flips the control once the hidden rows are out", () => {
		render(
			<PollsPanel
				{...props({ unmet: { count: 395, shown: true, onToggle: () => {} } })}
			/>
		);

		expect(
			screen.getByRole("button", { name: "hide them" })
		).toBeInTheDocument();
	});

	it("drops the footer entirely when nothing is hidden", () => {
		render(<PollsPanel {...props()} />);

		expect(screen.queryByRole("button", { name: /show as/ })).toBeNull();
	});
});
