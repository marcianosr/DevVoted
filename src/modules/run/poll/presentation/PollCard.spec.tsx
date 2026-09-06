import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import type { PollView } from "~/modules/run/run/application/pollView.viewmodel";
import { PollCard } from "~/modules/run/poll/presentation/PollCard.ui";
import { createMockPollView } from "~/test/runView.factory";

const options = [
	{ id: "a", label: "Alpha" },
	{ id: "b", label: "Beta" },
	{ id: "c", label: "Gamma" },
];

/** Three lettered options on a single-answer poll; each test names only what it varies. */
const poll = (overrides: Partial<PollView> = {}) =>
	createMockPollView({ options, ...overrides });

describe(PollCard, () => {
	it("renders the category name, question, and options", () => {
		render(
			<PollCard
				poll={poll({
					category: "react",
					question: "Which key?",
				})}
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
				poll={poll({
					category: "react",
					question: "Why won't this render?",
					codeBlock: "const App = () => {\n  <div>Hi</div>;\n};",
				})}
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
				poll={poll({
					category: "html",
					question: "See the sandbox below — which tags fit?",
					codeSandboxUrl: "https://codesandbox.io/embed/example",
				})}
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
				poll={poll({
					category: "react",
					question: "Which key?",
				})}
				onSelect={() => {}}
			/>
		);
		expect(container.querySelector("pre")).toBeNull();
	});

	it("reports a clicked option through onSelect without any submit button", () => {
		const onSelect = vi.fn();
		render(
			<PollCard
				poll={poll({
					category: "js",
					question: "Q",
				})}
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
				poll={poll({
					category: "js",
					question: "Q",
				})}
				disabledOptionIds={["c"]}
				onSelect={() => {}}
			/>
		);
		expect(screen.getByRole("button", { name: /Gamma/ })).toBeDisabled();
	});

	it("badges options as radios for single-answer polls and checkboxes for multiple", () => {
		const { container, rerender } = render(
			<PollCard
				poll={poll({
					category: "js",
					question: "Q",
				})}
				onSelect={() => {}}
			/>
		);
		expect(container.querySelectorAll('[data-shape="radio"]')).toHaveLength(
			options.length
		);
		rerender(
			<PollCard
				poll={poll({
					category: "js",
					question: "Q",
					answerType: "multiple",
				})}
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
				poll={poll({
					category: "css",
					question: "Q",
				})}
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
				poll={poll({
					category: "css",
					question: "Q",
				})}
				reveal={{ correctOptionIds: ["a"], chosenOptionIds: ["b"] }}
				onSelect={() => {}}
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
				poll={poll({
					category: "css",
					question: "Q",
					answerType: "multiple",
				})}
				reveal={{ correctOptionIds: ["a", "c"], chosenOptionIds: ["a", "b"] }}
				onSelect={() => {}}
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

	describe(".length's answer-count line", () => {
		const withCount = (correctAnswersThisGate: number) =>
			render(
				<PollCard
					poll={poll({
						category: "react",
						question: "Which are Kanto towns?",
						answerType: "multiple",
					})}
					correctAnswersThisGate={correctAnswersThisGate}
					onSelect={() => {}}
				/>
			);

		it("stays hidden when no config is counting", () => {
			render(
				<PollCard
					poll={poll({
						category: "react",
						question: "Q",
						answerType: "multiple",
					})}
					onSelect={() => {}}
				/>
			);
			expect(screen.queryByText(/correct answers?$/)).not.toBeInTheDocument();
		});

		it("reveals how many correct answers the gate holds", () => {
			withCount(6);
			expect(
				screen.getByText("this gate holds 6 correct answers")
			).toBeInTheDocument();
		});

		it("keeps the singular for a single answer", () => {
			withCount(1);
			expect(
				screen.getByText("this gate holds 1 correct answer")
			).toBeInTheDocument();
		});
	});

	it("locks the options once the result is revealed", () => {
		render(
			<PollCard
				poll={poll({
					category: "js",
					question: "Q",
				})}
				reveal={{ correctOptionIds: ["a"], chosenOptionIds: ["b"] }}
				onSelect={() => {}}
			/>
		);
		expect(screen.getByRole("button", { name: /Alpha/ })).toBeDisabled();
	});
});

describe("PollCard under 451 Unavailable For Legal Reasons", () => {
	const sealed = [
		{ id: "a", label: "?????" },
		{ id: "b", label: "Beta" },
		{ id: "c", label: "?????" },
	];

	const buyBack = { costKb: 4, ready: true, onBuyBack: () => {} };

	it("reads a sealed answer as ????? without naming it", () => {
		render(
			<PollCard
				poll={poll({ options: sealed })}
				hiddenOptionIds={["a", "c"]}
				buyBack={buyBack}
				onSelect={() => {}}
			/>
		);
		expect(screen.getAllByText("?????")).toHaveLength(2);
		expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
	});

	// Gambling blind is the point: a sealed option is priced, never locked.
	it("still takes a pick on a sealed answer", () => {
		const onSelect = vi.fn();
		render(
			<PollCard
				poll={poll({ options: sealed })}
				hiddenOptionIds={["a", "c"]}
				buyBack={buyBack}
				onSelect={onSelect}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: /A\s*\?\?\?\?\?/ }));
		expect(onSelect).toHaveBeenCalledWith("a");
	});

	it("prices a buy-back on each sealed answer and none of the readable ones", () => {
		render(
			<PollCard
				poll={poll({ options: sealed })}
				hiddenOptionIds={["a", "c"]}
				buyBack={buyBack}
				onSelect={() => {}}
			/>
		);
		expect(
			screen.getAllByRole("button", { name: /^Buy back option/ })
		).toHaveLength(2);
		expect(
			screen.queryByRole("button", { name: "Buy back option B" })
		).not.toBeInTheDocument();
	});

	it("buys back the answer whose press was hit", () => {
		const onBuyBack = vi.fn();
		render(
			<PollCard
				poll={poll({ options: sealed })}
				hiddenOptionIds={["a", "c"]}
				buyBack={{ ...buyBack, onBuyBack }}
				onSelect={() => {}}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: "Buy back option C" }));
		expect(onBuyBack).toHaveBeenCalledWith("c");
	});

	it("refuses the press when the balance cannot cover it", () => {
		render(
			<PollCard
				poll={poll({ options: sealed })}
				hiddenOptionIds={["a", "c"]}
				buyBack={{ ...buyBack, ready: false }}
				onSelect={() => {}}
			/>
		);
		expect(
			screen.getByRole("button", { name: "Buy back option A" })
		).toBeDisabled();
	});

	it("offers no buy-back on a poll the gate never sealed", () => {
		render(<PollCard poll={poll()} buyBack={buyBack} onSelect={() => {}} />);
		expect(
			screen.queryByRole("button", { name: /^Buy back option/ })
		).not.toBeInTheDocument();
	});
});
