import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { ChoiceState } from "./Choice.ui";
import { Question, type QuestionOption } from "./Question.ui";

const OPTIONS = [
	{ id: "option-1", letter: "A", label: "Partial<T>" },
	{ id: "option-2", letter: "B", label: "Optional<T>" },
	{ id: "option-3", letter: "C", label: "Maybe<T>" },
] satisfies QuestionOption[];

const props = {
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

	it("squares every keycap on a multi-answer poll, not just the sealed ones", () => {
		render(
			<Question
				{...props}
				answerType="multiple"
				options={[
					{ id: "option-1", letter: "A", label: "Partial<T>" },
					{ id: "option-2", letter: "B", seal: { price: "4 KB" } },
				]}
			/>
		);

		expect(screen.getByText("A")).toHaveClass("rounded-md");
		expect(screen.getByText("B")).toHaveClass("rounded-md");
	});

	it("rounds every keycap on a single-answer poll, one pick standing in for a radio", () => {
		render(
			<Question
				{...props}
				options={[{ id: "option-1", letter: "A", label: "Partial<T>" }]}
			/>
		);

		expect(screen.getByText("A")).toHaveClass("rounded-full");
	});
});

describe("Question's crossed-out options", () => {
	it("rules out an option a linter has crossed off", () => {
		render(
			<Question
				{...props}
				onPick={vi.fn()}
				options={[
					{ id: "a", letter: "A", label: "at(-1)" },
					{ id: "b", letter: "B", label: "pop()", crossedOut: true },
				]}
			/>
		);

		expect(screen.getByRole("button", { name: /pop\(\)/ })).toBeDisabled();
		expect(screen.getByRole("button", { name: /at\(-1\)/ })).toBeEnabled();
	});
});

const STATE_BY_ID: Record<string, ChoiceState> = {
	"option-1": "wrong",
	"option-2": "right",
};

describe("Question after the reveal", () => {
	it("hands each option's state to its choice", () => {
		render(
			<Question
				{...props}
				pickedIds={["option-1"]}
				options={OPTIONS.map((option) => ({
					...option,
					state: STATE_BY_ID[option.id],
				}))}
			/>
		);

		expect(screen.getByText("wrong")).toBeInTheDocument();
		expect(screen.getByText("right")).toBeInTheDocument();
		expect(
			screen.getByText("Maybe<T>").closest("[data-screen-theme]")
		).toBeNull();
	});
});

describe("the answer list's frame", () => {
	it("gathers the rows into one bordered box rather than gapping them", () => {
		render(<Question {...props} />);

		const row = screen.getByText(OPTIONS[0].label).closest("div,button");
		const list = row?.parentElement;

		expect(list).toHaveClass("rounded-lg", "border", "border-theme-faint");
		expect(list?.className).not.toMatch(/\bgap-/);
	});
});

describe("Question with code in it", () => {
	it("marks inline backticks as code inside the heading, backticks dropped", () => {
		render(<Question {...props} question="What does `flex: 1` expand to?" />);

		const heading = screen.getByRole("heading", {
			name: "What does flex: 1 expand to?",
		});
		expect(within(heading).getByText("flex: 1").tagName).toBe("CODE");
	});

	it("lifts a fenced block out of the heading into a code panel with its language", () => {
		const { container } = render(
			<Question
				{...props}
				question={"What does this log?\n```js\nconsole.log(0.1 + 0.2)\n```"}
			/>
		);

		expect(
			screen.getByRole("heading", { name: "What does this log?" })
		).toBeInTheDocument();
		expect(container.querySelector("pre code")).toHaveTextContent(
			"console.log(0.1 + 0.2)"
		);
		expect(container.querySelector("pre code")?.className).toMatch(
			/language-js/
		);
	});

	it("keeps prose after a block as a second line, never a second heading", () => {
		render(
			<Question
				{...props}
				question={
					"Given this:\n```css\n.a { flex: 1 }\n```\nwhat is its width?"
				}
			/>
		);

		expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
		expect(screen.getByText("what is its width?")).toBeInTheDocument();
	});

	it("interprets nothing but backticks", () => {
		render(<Question {...props} question="What does 2 > 1 return? *really*" />);

		expect(
			screen.getByRole("heading", { name: "What does 2 > 1 return? *really*" })
		).toBeInTheDocument();
	});

	it("keeps a rhyme on its own lines", () => {
		render(
			<Question {...props} question={"Roses are red,\nthe stack is blue"} />
		);

		expect(screen.getByRole("heading", { level: 1 }).firstChild).toHaveClass(
			"whitespace-pre-line"
		);
	});
});

const VUE_SETUP =
	"```ts\n<script setup>\nimport { ref } from 'vue';\nconst count = ref(0);\n</script>\n```";

describe("Question's options with code in them", () => {
	it("marks an option's inline backticks as code, backticks dropped", () => {
		render(
			<Question
				{...props}
				options={[
					{ id: "option-1", letter: "A", label: "`ref` works with primitives" },
				]}
			/>
		);

		expect(screen.getByText("ref").tagName).toBe("CODE");
		expect(screen.queryByText(/`/)).not.toBeInTheDocument();
	});

	it("lifts an option's fenced block into a code panel, its fence and language tag gone and its lines kept", () => {
		const { container } = render(
			<Question
				{...props}
				options={[{ id: "option-1", letter: "A", label: VUE_SETUP }]}
			/>
		);

		const code = container.querySelector("[data-choices] pre code");
		expect(code?.textContent).toBe(
			"<script setup>\nimport { ref } from 'vue';\nconst count = ref(0);\n</script>\n"
		);
		expect(code?.className).toMatch(/language-ts/);
		expect(container.querySelector("[data-choices]")).not.toHaveTextContent(
			"```"
		);
	});
});

describe("each option's own explanation", () => {
	const EXPLAINED = [
		{
			...OPTIONS[0],
			state: "right",
			explanation: { text: "It maps every key to `?`.", right: true },
		},
		{
			...OPTIONS[1],
			state: "idle",
			explanation: { text: "Not a built-in.", right: false },
		},
		OPTIONS[2],
	] satisfies QuestionOption[];

	const rowOf = (label: string) =>
		screen.getByText(label).closest<HTMLElement>("[data-answer]")!;

	it("explains a right option as why it’s right, under its own row", () => {
		render(<Question {...props} options={EXPLAINED} />);

		const row = rowOf("Partial<T>");
		expect(within(row).getByText("Why it’s right")).toBeInTheDocument();
		expect(
			row.querySelector("[data-note] [data-screen-theme=viridian]")
		).toHaveTextContent("✓");
	});

	it("explains a wrong option as why it’s wrong, picked or not", () => {
		render(<Question {...props} options={EXPLAINED} />);

		const row = rowOf("Optional<T>");
		expect(row).toHaveAttribute("data-answer", "idle");
		expect(within(row).getByText("Why it’s wrong")).toBeInTheDocument();
		expect(within(row).getByText("Not a built-in.")).toBeInTheDocument();
		expect(
			row.querySelector("[data-note] [data-screen-theme=cinnabar]")
		).toHaveTextContent("✗");
	});

	it("marks an explanation's inline backticks as code", () => {
		render(<Question {...props} options={EXPLAINED} />);

		expect(within(rowOf("Partial<T>")).getByText("?").tagName).toBe("CODE");
	});

	it("draws no explanation for an option that explains nothing", () => {
		render(<Question {...props} options={EXPLAINED} />);

		expect(rowOf("Maybe<T>").querySelector("[data-note]")).toBeNull();
		expect(screen.getAllByText(/Why it’s/)).toHaveLength(2);
	});
});
