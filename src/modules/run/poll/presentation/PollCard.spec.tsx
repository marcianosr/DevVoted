import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { PollCard } from "~/modules/run/poll/presentation/PollCard.ui";

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

	it("renders the poll's code_block as a highlighted code block", () => {
		const { container } = render(
			<PollCard
				category="react"
				question="Why won't this render?"
				codeBlock={"const App = () => {\n  <div>Hi</div>;\n};"}
				answerType="single"
				options={options}
				onSelect={() => {}}
			/>
		);
		const pre = container.querySelector("pre");
		expect(pre).not.toBeNull();
		// highlight.js fragments the source into token spans, so assert on the
		// reassembled textContent rather than a single text node.
		expect(pre?.textContent).toContain("const App = () =>");
	});

	it("embeds a CodeSandbox frame when the poll carries a sandbox url", () => {
		render(
			<PollCard
				category="html"
				question="See the sandbox below — which tags fit?"
				codeSandboxUrl="https://codesandbox.io/embed/example"
				answerType="single"
				options={options}
				onSelect={() => {}}
			/>
		);
		const frame = screen.getByTitle("CodeSandbox example");
		expect(frame).toHaveAttribute(
			"src",
			"https://codesandbox.io/embed/example"
		);
	});

	it("omits the code block when the poll has no code_block", () => {
		const { container } = render(
			<PollCard
				category="react"
				question="Which key?"
				answerType="single"
				options={options}
				onSelect={() => {}}
			/>
		);
		expect(container.querySelector("pre")).toBeNull();
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

	it("badges options as radios for single-answer polls and checkboxes for multiple", () => {
		const { container, rerender } = render(
			<PollCard
				category="js"
				question="Q"
				answerType="single"
				options={options}
				onSelect={() => {}}
			/>
		);
		expect(container.querySelectorAll('[data-shape="radio"]')).toHaveLength(
			options.length
		);
		rerender(
			<PollCard
				category="js"
				question="Q"
				answerType="multiple"
				options={options}
				onSelect={() => {}}
			/>
		);
		expect(container.querySelectorAll('[data-shape="checkbox"]')).toHaveLength(
			options.length
		);
	});

	it("labels each option with a letter badge", () => {
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
			screen.getByRole("button", { name: /A\s*Alpha/ })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /C\s*Gamma/ })
		).toBeInTheDocument();
	});

	it("swaps the letter for a ✓/✕ mark on revealed correct and chosen-wrong options", () => {
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
			screen.getByRole("button", { name: /C\s*Gamma/ })
		).toBeInTheDocument();
	});

	it("distinguishes a correct answer you chose from one you missed", () => {
		render(
			<PollCard
				category="css"
				question="Q"
				answerType="multiple"
				options={options}
				onSelect={() => {}}
				correctOptionIds={["a", "c"]}
				chosenOptionIds={["a", "b"]}
			/>
		);
		const statusOf = (label: RegExp) =>
			screen
				.getByRole("button", { name: label })
				.querySelector("[data-status]")
				?.getAttribute("data-status");
		// Alpha: correct and picked; Gamma: correct but missed — same ✓, different status.
		expect(statusOf(/Alpha/)).toBe("correctChosen");
		expect(statusOf(/Gamma/)).toBe("correctMissed");
		expect(statusOf(/Beta/)).toBe("chosenWrong");
	});

	describe(".length's pick budget line", () => {
		const withBudget = (
			pickBudgetLeft: number,
			selectedOptionIds: string[] = []
		) =>
			render(
				<PollCard
					category="react"
					question="Which are Kanto towns?"
					answerType="multiple"
					options={options}
					selectedOptionIds={selectedOptionIds}
					pickBudgetLeft={pickBudgetLeft}
					onSelect={() => {}}
				/>
			);

		it("stays hidden when no config is counting picks", () => {
			render(
				<PollCard
					category="react"
					question="Q"
					answerType="multiple"
					options={options}
					onSelect={() => {}}
				/>
			);
			expect(screen.queryByText(/picks? left/)).not.toBeInTheDocument();
		});

		it("counts the tentative selection, not just the submitted picks", () => {
			withBudget(3, ["a"]);
			expect(screen.getByText("2 picks left this gate")).toBeInTheDocument();
		});

		it("says budget spent on the pick that lands exactly on it", () => {
			withBudget(2, ["a", "b"]);
			expect(screen.getByText("budget spent")).toBeInTheDocument();
		});

		it("warns the moment the selection goes over, before it is submitted", () => {
			withBudget(1, ["a", "b", "c"]);
			expect(screen.getByText("2 picks over budget")).toBeInTheDocument();
		});

		it("keeps the singular on the last pick the budget has", () => {
			withBudget(1);
			expect(screen.getByText("1 pick left this gate")).toBeInTheDocument();
		});

		it("keeps the singular one pick over the budget", () => {
			withBudget(0, ["a"]);
			expect(screen.getByText("1 pick over budget")).toBeInTheDocument();
		});
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
