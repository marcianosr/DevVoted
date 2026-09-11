import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { PollResult, type PollResultProps } from "./PollResult.ui";

const REVEALED: PollResultProps = {
	state: "revealed",
	index: 1,
	question: "Which property centres a flex child along the main axis?",
	category: "CSS",
	outcome: "wrong",
	rightShare: 22,
	open: true,
	options: [
		{
			letter: "A",
			label: "justify-content",
			percent: 22,
			votes: 265,
			isRight: true,
			voters: [{ name: "Misty" }, { name: "Brock" }],
		},
		{
			letter: "B",
			label: "align-items",
			percent: 58,
			votes: 698,
			isRight: false,
			yours: true,
			voters: [{ name: "Erika" }],
			voterOverflow: 696,
		},
	],
};

const SEALED: PollResultProps = {
	state: "sealed",
	index: 2,
	question: "What does a rebase rewrite?",
};

const summary = (): HTMLElement => {
	const row = screen.getByText(REVEALED.question).closest("summary");
	if (row === null) throw new Error("the revealed poll drew no summary row");
	return row;
};

describe("PollResult, revealed", () => {
	it("reads the room's share as its own figure, not as prose", () => {
		render(<PollResult {...REVEALED} />);

		expect(within(summary()).getByText("22%")).toBeInTheDocument();
	});

	it("tones the share by how the room found it", () => {
		render(<PollResult {...REVEALED} />);

		expect(within(summary()).getByText("22%")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("marks the option the viewer picked", () => {
		render(<PollResult {...REVEALED} />);

		expect(screen.getByText("You")).toBeInTheDocument();
	});

	it("counts the voters it could not draw", () => {
		render(<PollResult {...REVEALED} />);

		expect(screen.getByText("+696")).toBeInTheDocument();
	});

	it("names the voter and vote columns with icons rather than a header line", () => {
		render(<PollResult {...REVEALED} />);

		expect(screen.getByLabelText("who picked it")).toBeInTheDocument();
		expect(screen.getByLabelText("votes")).toBeInTheDocument();
		expect(screen.queryByText(/Who picked it/)).toBeNull();
	});

	it("draws every option with its vote count", () => {
		render(<PollResult {...REVEALED} />);

		expect(screen.getByText("265")).toBeInTheDocument();
		expect(screen.getByText("698")).toBeInTheDocument();
	});
});

describe("PollResult, sealed", () => {
	it("shows the question and nothing the viewer has not earned", () => {
		render(<PollResult {...SEALED} />);

		expect(screen.getByText("What does a rebase rewrite?")).toBeInTheDocument();
		expect(screen.queryByText(/%$/)).toBeNull();
	});

	it("withholds the category, since the poll may be dealt again", () => {
		render(<PollResult {...SEALED} />);

		expect(screen.queryByText("Git")).toBeNull();
		expect(screen.queryByText("???")).toBeNull();
	});

	it("cannot be opened, because there is nothing behind it", () => {
		const { container } = render(<PollResult {...SEALED} />);

		expect(container.querySelector("details")).toBeNull();
	});

	it("draws no voters", () => {
		const { container } = render(<PollResult {...SEALED} />);

		expect(container.querySelector("img")).toBeNull();
	});
});
