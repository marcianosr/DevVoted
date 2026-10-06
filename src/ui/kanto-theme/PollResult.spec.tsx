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

	it("badges the category under the question", () => {
		render(<PollResult {...REVEALED} />);

		expect(within(summary()).getByText("CSS")).toHaveClass("badge-theme");
	});

	it("states the room's share once, as the badge", () => {
		render(<PollResult {...REVEALED} />);

		expect(within(summary()).queryByText(/right$/)).toBeNull();
		expect(within(summary()).getAllByText(/22%/)).toHaveLength(1);
	});

	it("marks the right option as the answer rather than toning its share", () => {
		render(<PollResult {...REVEALED} />);
		const right = screen.getByText("justify-content").closest("[data-option]");
		if (!(right instanceof HTMLElement))
			throw new Error("the right option drew no row");

		expect(within(right).getByText("answer")).toBeInTheDocument();
		expect(screen.getAllByText("answer")).toHaveLength(1);
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

	it("draws as a row of its parent panel, with no surface of its own", () => {
		const { container } = render(<PollResult {...SEALED} />);

		expect(container.firstElementChild).not.toHaveClass("rounded-2xl");
	});

	it("draws no voters", () => {
		const { container } = render(<PollResult {...SEALED} />);

		expect(container.querySelector("img")).toBeNull();
	});
});

describe("PollResult's options with code in them", () => {
	it("marks an option's inline backticks as code, backticks dropped", () => {
		render(
			<PollResult
				{...REVEALED}
				options={[
					{
						letter: "A",
						label: "`v-if` removes the element",
						percent: 50,
						votes: 2,
						isRight: true,
					},
				]}
			/>
		);

		expect(screen.getByText("v-if").tagName).toBe("CODE");
	});

	it("lifts an option's fenced block into a code panel and keeps its lines", () => {
		const { container } = render(
			<PollResult
				{...REVEALED}
				options={[
					{
						letter: "A",
						label: "```ts\nconst count = ref(0);\ncount.value++;\n```",
						percent: 50,
						votes: 2,
						isRight: true,
					},
				]}
			/>
		);

		const code = container.querySelector("[data-option] pre code");
		expect(code?.textContent).toBe("const count = ref(0);\ncount.value++;\n");
		expect(container.querySelector("[data-option]")).not.toHaveTextContent(
			"```"
		);
	});
});
