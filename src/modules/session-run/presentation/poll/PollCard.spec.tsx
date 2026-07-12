import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { PollCard } from "./PollCard.ui";

const options = [
	{ id: "a", label: "Alpha" },
	{ id: "b", label: "Beta" },
	{ id: "c", label: "Gamma" },
];

describe("PollCard", () => {
	it("renders the category name, question, and options", () => {
		render(
			<PollCard
				category="react"
				question="Which key?"
				options={options}
				answerType="single"
				onSelect={() => {}}
			/>
		);
		expect(screen.getByRole("heading", { name: "React" })).toBeInTheDocument();
		expect(screen.getByText("Which key?")).toBeInTheDocument();
		expect(screen.getByText("Alpha")).toBeInTheDocument();
	});

	it("single-choice answers immediately on click, with no submit button", () => {
		const onSelect = vi.fn();
		render(
			<PollCard
				category="js"
				question="Q"
				options={options}
				answerType="single"
				onSelect={onSelect}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: /Alpha/ }));
		expect(onSelect).toHaveBeenCalledWith("a");
		expect(
			screen.queryByRole("button", { name: /Submit/ })
		).not.toBeInTheDocument();
	});

	it("multiple-choice toggles a selection and submits it", () => {
		const onSelect = vi.fn();
		const onSubmit = vi.fn();
		render(
			<PollCard
				category="ts"
				question="Q"
				options={options}
				answerType="multiple"
				selectedOptionIds={["a"]}
				onSelect={onSelect}
				onSubmit={onSubmit}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: /Beta/ }));
		expect(onSelect).toHaveBeenCalledWith("b");
		fireEvent.click(screen.getByRole("button", { name: /Submit/ }));
		expect(onSubmit).toHaveBeenCalledTimes(1);
	});

	it("multiple-choice disables submit with an empty selection", () => {
		render(
			<PollCard
				category="ts"
				question="Q"
				options={options}
				answerType="multiple"
				selectedOptionIds={[]}
				onSelect={() => {}}
				onSubmit={() => {}}
			/>
		);
		expect(screen.getByRole("button", { name: /Submit/ })).toBeDisabled();
	});

	it("does not answer a disabled (linted) option", () => {
		render(
			<PollCard
				category="js"
				question="Q"
				options={options}
				answerType="single"
				disabledOptionIds={["c"]}
				onSelect={() => {}}
			/>
		);
		expect(screen.getByRole("button", { name: /Gamma/ })).toBeDisabled();
	});

	it("locks the options once the result is revealed", () => {
		render(
			<PollCard
				category="js"
				question="Q"
				options={options}
				answerType="single"
				onSelect={() => {}}
				correctOptionIds={["a"]}
				chosenOptionIds={["b"]}
			/>
		);
		expect(screen.getByRole("button", { name: /Alpha/ })).toBeDisabled();
	});
});
