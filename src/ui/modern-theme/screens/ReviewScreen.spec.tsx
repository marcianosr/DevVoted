import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ReviewScreen, type ReviewPoll } from "./ReviewScreen.ui";

const polls: readonly ReviewPoll[] = [
	{
		id: "shallow-copy",
		outcome: "correct",
		question: "Which array method returns a shallow copy?",
		score: 2.6,
		options: [
			{ id: "slice", label: "arr.slice()", expected: true, received: true },
			{ id: "splice", label: "arr.splice()" },
		],
	},
	{
		id: "tuples",
		outcome: "wrong",
		question: "Which Python built-in returns an iterator of tuples?",
		score: -0.4,
		options: [
			{ id: "map", label: "map()", received: true },
			{ id: "zip", label: "zip()", expected: true },
		],
		explainer: "zip() pairs items from several iterables into tuples.",
	},
];

const props = { gateName: "Lavender", gate: 4, polls, theme: "lavender" };

describe("ReviewScreen", () => {
	it("names the gate whose polls are under review", () => {
		render(<ReviewScreen {...props} />);

		expect(
			screen.getByRole("heading", { name: "Review · Lavender gate 4" })
		).toBeInTheDocument();
	});

	it("carries no tally in the header, which the rows already spell out", () => {
		render(<ReviewScreen {...props} />);

		expect(screen.queryByText(/passed/)).not.toBeInTheDocument();
		expect(screen.queryByText(/partial/)).not.toBeInTheDocument();
	});

	it("lists every poll of the gate, passes included", () => {
		render(<ReviewScreen {...props} />);

		expect(screen.getAllByRole("listitem")).toHaveLength(polls.length);
		expect(screen.getByText("PASS")).toBeInTheDocument();
		expect(screen.getByText("FAIL")).toBeInTheDocument();
	});

	it("explains only the poll that was missed", () => {
		render(<ReviewScreen {...props} />);

		expect(
			screen.getByText("zip() pairs items from several iterables into tuples.")
		).toBeInTheDocument();
		expect(screen.getAllByText("Expected")).toHaveLength(1);
	});

	it("offers no way back until one is wired", () => {
		render(<ReviewScreen {...props} />);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("returns the player wherever the caller came from", async () => {
		const onUse = vi.fn();
		render(
			<ReviewScreen
				{...props}
				back={{ label: "← Back to removal", onUse }}
				note="2 configs still to pick"
			/>
		);

		await userEvent.click(
			screen.getByRole("button", { name: "← Back to removal" })
		);

		expect(onUse).toHaveBeenCalledOnce();
		expect(screen.getByText("2 configs still to pick")).toBeInTheDocument();
	});
});
