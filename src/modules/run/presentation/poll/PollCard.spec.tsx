import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { PollCard } from "./PollCard.ui";

const options = [
	{ id: "a", label: "Alpha" },
	{ id: "b", label: "Beta" },
	{ id: "c", label: "Gamma" },
];

describe(PollCard, () => {
	it("renders the category name, question, and options", () => {
		render(
			<PollCard
				category="react"
				question="Which key?"
				answerType="single"
				options={options}
				onSelect={() => {}}
			/>
		);
		expect(screen.getByRole("heading", { name: "React" })).toBeInTheDocument();
		expect(screen.getByText("Which key?")).toBeInTheDocument();
		expect(screen.getByText("Alpha")).toBeInTheDocument();
	});

	it("reports a clicked option through onSelect without any submit button", () => {
		const onSelect = vi.fn();
		render(
			<PollCard
				category="js"
				question="Q"
				answerType="single"
				options={options}
				onSelect={onSelect}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: /Alpha/ }));
		expect(onSelect).toHaveBeenCalledWith("a");
		// Submitting is now the Screen's footer action — the card never renders one.
		expect(
			screen.queryByRole("button", { name: /Submit/ })
		).not.toBeInTheDocument();
	});

	it("does not answer a disabled (linted) option", () => {
		render(
			<PollCard
				category="js"
				question="Q"
				answerType="single"
				options={options}
				disabledOptionIds={["c"]}
				onSelect={() => {}}
			/>
		);
		expect(screen.getByRole("button", { name: /Gamma/ })).toBeDisabled();
	});

	it("tells the player how many answers a poll expects", () => {
		const { rerender } = render(
			<PollCard
				category="js"
				question="Q"
				answerType="single"
				options={options}
				onSelect={() => {}}
			/>
		);
		expect(screen.getByText("Pick one answer")).toBeInTheDocument();
		rerender(
			<PollCard
				category="js"
				question="Q"
				answerType="multiple"
				options={options}
				onSelect={() => {}}
			/>
		);
		expect(
			screen.getByText("Multiple answers — select all that apply")
		).toBeInTheDocument();
	});

	it("numbers each option with a zero-padded index", () => {
		render(
			<PollCard
				category="css"
				question="Q"
				answerType="single"
				options={options}
				onSelect={() => {}}
			/>
		);
		expect(
			screen.getByRole("button", { name: /01\s*Alpha/ })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /03\s*Gamma/ })
		).toBeInTheDocument();
	});

	it("swaps the index for a ✓/✕ mark on revealed correct and chosen-wrong options", () => {
		render(
			<PollCard
				category="css"
				question="Q"
				answerType="single"
				options={options}
				onSelect={() => {}}
				correctOptionIds={["a"]}
				chosenOptionIds={["b"]}
			/>
		);
		expect(
			screen.getByRole("button", { name: /✓\s*Alpha/ })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /✕\s*Beta/ })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /03\s*Gamma/ })
		).toBeInTheDocument();
	});

	it("locks the options once the result is revealed", () => {
		render(
			<PollCard
				category="js"
				question="Q"
				answerType="single"
				options={options}
				onSelect={() => {}}
				correctOptionIds={["a"]}
				chosenOptionIds={["b"]}
			/>
		);
		expect(screen.getByRole("button", { name: /Alpha/ })).toBeDisabled();
	});
});
