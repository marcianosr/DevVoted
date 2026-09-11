import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Question, type QuestionOption } from "./Question.ui";

const OPTIONS = [
	{ id: "option-1", letter: "A", label: "Partial<T>" },
	{ id: "option-2", letter: "B", label: "Optional<T>" },
	{ id: "option-3", letter: "C", label: "Maybe<T>" },
] satisfies QuestionOption[];

const props = {
	category: "TypeScript",
	answerType: "single",
	question: "Which utility type makes every property optional?",
	options: OPTIONS,
} as const;

describe("Question", () => {
	it("asks the question at the screen's loudest size", () => {
		render(<Question {...props} />);

		expect(screen.getByRole("heading", { name: props.question })).toHaveClass(
			"text-display"
		);
	});

	it("badges the category the poll was drawn from", () => {
		render(<Question {...props} />);

		expect(screen.getByText("TypeScript")).toHaveClass("badge-theme");
	});

	it("lets the category badge follow the screen unless given a colour", () => {
		render(<Question {...props} />);

		expect(screen.getByText("TypeScript")).not.toHaveAttribute(
			"data-screen-theme"
		);
	});

	it("counts the options and names a single-answer poll", () => {
		render(<Question {...props} />);

		expect(screen.getByText("3 options · single answer")).toBeInTheDocument();
	});

	it("names a multiple-answer poll in the plural", () => {
		render(<Question {...props} answerType="multiple" />);

		expect(
			screen.getByText("3 options · multiple answers")
		).toBeInTheDocument();
	});

	it("prices a wrong answer beside the poll's own facts", () => {
		render(<Question {...props} wrongCost="0.77" />);

		expect(screen.getByText("wrong costs")).toBeInTheDocument();
		expect(screen.getByText("0.77")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("says nothing about the cost of a miss when there is none to name", () => {
		render(<Question {...props} />);

		expect(screen.queryByText("wrong costs")).not.toBeInTheDocument();
	});

	it("keeps the price on the facts row rather than above the question", () => {
		render(<Question {...props} wrongCost="0.77" />);

		const facts = screen.getByText("wrong costs").closest("div");
		expect(facts).toHaveTextContent("TypeScript");
		expect(facts).toHaveTextContent("3 options");
	});

	it("lists one choice per option, lettered", () => {
		render(<Question {...props} />);

		expect(screen.getByText("Partial<T>")).toBeInTheDocument();
		expect(screen.getByText("C")).toBeInTheDocument();
	});

	it("marks exactly the picked options, leaving the rest unpressed", () => {
		render(<Question {...props} pickedIds={["option-2"]} onPick={vi.fn()} />);

		const pressed = screen.getAllByRole("button", { pressed: true });
		expect(pressed).toHaveLength(1);
		expect(pressed[0]).toHaveTextContent("Optional<T>");
	});

	it("reports the option's id rather than its letter, so ids stay the key", async () => {
		const onPick = vi.fn();
		render(<Question {...props} onPick={onPick} />);

		await userEvent.click(screen.getByText("Maybe<T>"));

		expect(onPick).toHaveBeenCalledWith("option-3");
	});

	it("renders unpickable rows when no handler is given", () => {
		render(<Question {...props} />);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("shows no code panel when the poll carries none", () => {
		const { container } = render(<Question {...props} />);

		expect(container.querySelector("pre")).toBeNull();
	});

	it("shows the code panel between the question and the answers", () => {
		const { container } = render(
			<Question {...props} codeBlock="const gate = 9;" />
		);

		expect(container.querySelector("pre code")).toHaveTextContent(
			"const gate = 9;"
		);
	});

	it("seals an answer without leaking its label", () => {
		render(
			<Question
				{...props}
				options={[
					{ id: "option-1", letter: "A", label: "Partial<T>" },
					{ id: "option-2", letter: "B", seal: { price: "4 KB" } },
				]}
			/>
		);

		expect(screen.getByText("4 KB")).toBeInTheDocument();
		expect(screen.queryByText("Optional<T>")).not.toBeInTheDocument();
	});
});
