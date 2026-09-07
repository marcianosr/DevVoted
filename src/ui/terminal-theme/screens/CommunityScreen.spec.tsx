import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	CommunityScreen,
	type CommunityScreenProps,
} from "./CommunityScreen.ui";

const baseProps: CommunityScreenProps = {
	standouts: [
		{
			title: "deepest",
			avatar: { name: "Owen Vink", you: false },
			detail: "gate 10 · poll 2",
		},
	],
	pollChips: [
		{ id: "10", label: "1", disabled: false },
		{ id: "11", label: "2", disabled: false },
		{ id: "12", label: "3", disabled: true },
	],
	selectedChipId: "11",
	poll: {
		category: "TypeScript",
		rightShare: "22% got it",
		question: "Which TypeScript type does this produce?",
		multiple: false,
		rows: [
			{ letter: "A", label: "string", percent: 22, right: true, yours: false },
			{ letter: "B", label: "number", percent: 68, right: false, yours: true },
		],
	},
	totalPlayers: 9,
	topPercent: 18,
	back: { label: "Today's climb →" },
};

describe("CommunityScreen", () => {
	it("draws a standout box with its title, avatar and detail line", () => {
		render(<CommunityScreen {...baseProps} />);

		expect(screen.getByText("deepest")).toBeInTheDocument();
		expect(screen.getByRole("img", { name: "Owen Vink" })).toBeInTheDocument();
		expect(screen.getByText("gate 10 · poll 2")).toBeInTheDocument();
	});

	it("selects a poll through its chip, but never a sealed one", async () => {
		const user = userEvent.setup();
		const onSelectPoll = vi.fn();
		render(<CommunityScreen {...baseProps} onSelectPoll={onSelectPoll} />);

		await user.click(screen.getByRole("tab", { name: "1" }));
		expect(onSelectPoll).toHaveBeenCalledWith("10");

		await user.click(screen.getByRole("tab", { name: "3" }));
		expect(onSelectPoll).not.toHaveBeenCalledWith("12");
	});

	it("marks the right row alone, and badges the viewer's own pick", () => {
		render(<CommunityScreen {...baseProps} />);

		expect(screen.getAllByText("✓")).toHaveLength(1);
		expect(screen.getByText("you")).toBeInTheDocument();
		expect(screen.getByText("68%")).toBeInTheDocument();
	});

	it("shows the sealed note instead of a question when the poll is withheld", () => {
		render(
			<CommunityScreen
				{...baseProps}
				poll={undefined}
				pollNote="Sealed — this poll may come back in a later seed."
			/>
		);

		expect(
			screen.getByText("Sealed — this poll may come back in a later seed.")
		).toBeInTheDocument();
		expect(
			screen.queryByText("Which TypeScript type does this produce?")
		).not.toBeInTheDocument();
	});

	it("prints the countdown and the day percentile", () => {
		render(<CommunityScreen {...baseProps} countdown="New polls in 6h 12m" />);

		expect(screen.getByText("New polls in 6h 12m")).toBeInTheDocument();
		expect(screen.getByText(/top/)).toBeInTheDocument();
		expect(screen.getByText("18%")).toBeInTheDocument();
	});

	it("disables the way back and says why on the lock", () => {
		render(
			<CommunityScreen
				{...baseProps}
				back={{
					label: "Back to your run",
					disabled: true,
					hint: "The day is played out.",
				}}
			/>
		);

		const button = screen.getByRole("button", {
			name: "Back to your run, The day is played out.",
		});
		expect(button).toBeDisabled();
	});

	it("counts the day's players beside the poll board", () => {
		render(<CommunityScreen {...baseProps} />);

		expect(screen.getByText("9 players answered")).toBeInTheDocument();
	});
});
