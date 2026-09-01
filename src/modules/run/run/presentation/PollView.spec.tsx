import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import { createMockPollView, createMockRunView } from "~/test/runView.factory";

import { PollView, type PollViewProps } from "./PollView.component";

const poll = createMockPollView({
	id: "poll-1",
	category: "ts",
	question: "Which line returns the last two, unmutated?",
	options: [
		{ id: "option-1", label: "arr.slice(-2)" },
		{ id: "option-2", label: "arr.splice(-2)" },
		{ id: "option-3", label: "arr.at(-2)" },
	],
});

const answer = (
	id: string,
	outcome: AnsweredPoll["outcome"]
): AnsweredPoll => ({
	id,
	question: "q",
	category: "js",
	outcome,
	picked: [],
});

const view = createMockRunView({
	gatesCleared: 4,
	poll,
	configs: [CONFIGS.js, CONFIGS.ts],
	answeredThisGate: [answer("a", "correct"), answer("b", "wrong")],
});

const render_ = (overrides: Partial<PollViewProps> = {}) =>
	render(
		<PollView
			view={view}
			poll={poll}
			selectedOptionIds={[]}
			onSelect={() => {}}
			onSubmit={() => {}}
			onLint={() => {}}
			onPeek={() => {}}
			{...overrides}
		/>
	);

const factsLine = () => screen.getByText("scores").closest("p");

const scoreChip = () => {
	const line = factsLine();
	if (!line) throw new Error("No facts line rendered");
	return within(line).getByText(/^×/);
};

describe("PollView", () => {
	it("redacts the category under 404 rather than naming it", () => {
		render_({ view: createMockRunView({ ...view, categoryHidden: true }) });

		expect(screen.getByText("???")).toBeInTheDocument();
		expect(screen.queryByText("TypeScript")).not.toBeInTheDocument();
	});

	it("wears the gate it is being played at", () => {
		render_();

		expect(
			screen.getByRole("heading", { name: "Gate 4 · Lavender" })
		).toBeInTheDocument();
	});

	it("draws one crumb per poll in the window, whatever has been answered", () => {
		const { container } = render_();
		const trail = container.querySelector("nav");
		if (!trail) throw new Error("No trail rendered");

		expect(within(trail).getByText("5")).toBeInTheDocument();
	});

	it("marks the answered polls with their real verdicts and the next as current", () => {
		const { container } = render_();
		const trail = container.querySelector("nav");
		if (!trail) throw new Error("No trail rendered");

		expect(within(trail).getByText(/— correct/)).toBeInTheDocument();
		expect(within(trail).getByText(/— wrong/)).toBeInTheDocument();
		expect(trail.querySelector('[aria-current="step"]')).toHaveTextContent("3");
	});

	it("prices the poll by its own difficulty, not the gate's", () => {
		render_();

		expect(screen.getByText("3 options")).toBeInTheDocument();
		expect(screen.getByText("scores")).toBeInTheDocument();
		expect(scoreChip()).toHaveTextContent(/^×/);
	});

	it("says a multi-answer poll takes more than one pick", () => {
		render_({ poll: { ...poll, answerType: "multiple" } });

		expect(screen.getByText("pick every correct one")).toBeInTheDocument();
	});

	it("reports each pick as the player makes it", async () => {
		const onSelect = vi.fn();
		render_({ onSelect });

		await userEvent.click(screen.getByRole("radio", { name: /arr\.slice/ }));

		expect(onSelect).toHaveBeenCalledWith("option-1");
	});

	it("holds the answer back until something is picked", () => {
		render_();

		expect(
			screen.getByRole("button", { name: "Pick an answer" })
		).toBeDisabled();
	});

	it("sends the answer once a pick is in", async () => {
		const onSubmit = vi.fn();
		render_({ selectedOptionIds: ["option-1"], onSubmit });

		await userEvent.click(
			screen.getByRole("button", { name: "Submit answer →" })
		);

		expect(onSubmit).toHaveBeenCalledOnce();
	});

	it("crosses an eliminated option out rather than removing it", () => {
		render_({
			view: createMockRunView({ ...view, disabledOptionIds: ["option-2"] }),
		});

		expect(screen.getByText("crossed out")).toBeInTheDocument();
		expect(screen.getByRole("radio", { name: /arr\.splice/ })).toBeDisabled();
	});

	it("collapses a per-gate audit id onto the one the kit can draw", () => {
		render_({
			view: createMockRunView({
				...view,
				audits: [
					{
						id: "timeout-4",
						name: "408 Request Timeout",
						description: "On the clock.",
						suppressed: false,
					},
				],
			}),
		});

		expect(screen.getByText("1 audit")).toBeInTheDocument();
		expect(screen.getAllByText("408 Request Timeout")).toHaveLength(2);
		expect(screen.getByText("On the clock.")).toBeInTheDocument();
	});

	it("gives every live audit its own alert under the build", () => {
		render_({
			view: createMockRunView({
				...view,
				audits: [
					{
						id: "strip-1",
						name: "410 Gone",
						description: "A miss peels 5.",
						suppressed: false,
					},
					{
						id: "mirrored",
						name: "300 Multiple Choices",
						description: "Pick every wrong option.",
						suppressed: false,
					},
				],
			}),
		});

		expect(screen.getByText("A miss peels 5.")).toBeInTheDocument();
		expect(screen.getByText("Pick every wrong option.")).toBeInTheDocument();
	});

	it("keeps an offline config on the rail, named and readable", () => {
		const { container } = render_({
			view: createMockRunView({
				...view,
				offlineConfigs: [
					{ config: CONFIGS.ts, audit: "424 Failed Dependency" },
				],
			}),
		});

		expect(screen.getByText(".ts")).toHaveClass("line-through");
		expect(container.querySelector(".opacity-50")).not.toBeInTheDocument();
	});

	it("blames the audit by name rather than reporting a dead row", () => {
		render_({
			view: createMockRunView({
				...view,
				offlineConfigs: [
					{ config: CONFIGS.ts, audit: "424 Failed Dependency" },
				],
			}),
		});

		expect(
			screen.getByText(/\.ts · offline · 424 Failed Dependency/)
		).toBeInTheDocument();
	});

	it("counts the run's faucet allowance down on the config earning it", () => {
		render_({
			view: createMockRunView({
				...view,
				configs: [CONFIGS.indexedDb],
				faucetRemainingKb: 216,
			}),
		});

		expect(screen.getByText(/216 KB left/)).toBeInTheDocument();
	});

	it("sits the faucet out once the run's allowance is spent", () => {
		render_({
			view: createMockRunView({
				...view,
				configs: [CONFIGS.indexedDb],
				faucetRemainingKb: 0,
			}),
		});

		expect(
			screen.getByText("the run's storage cap is spent")
		).toBeInTheDocument();
		expect(screen.queryByText("+8 KB")).not.toBeInTheDocument();
	});

	it("states the gate's answer count beside the poll when a config counts them", () => {
		render_({
			view: createMockRunView({ ...view, correctAnswersThisGate: 7 }),
		});

		expect(
			screen.getByText(/this gate holds 7 correct answers/)
		).toBeInTheDocument();
	});

	it("counts the incorrect ones instead where the gate mirrors its polls", () => {
		render_({
			view: createMockRunView({
				...view,
				correctAnswersThisGate: 1,
				mirroredPolls: true,
			}),
		});

		expect(
			screen.getByText(/this gate holds 1 incorrect answer/)
		).toBeInTheDocument();
	});

	it("says nothing about the count when no config is counting", () => {
		render_();

		expect(screen.queryByText(/this gate holds/)).not.toBeInTheDocument();
	});

	it("prices a wrong answer and a missed gate on the poll's own facts line", () => {
		render_({
			view: createMockRunView({
				...view,
				gateStake: {
					...view.gateStake,
					peelSlotsOnFailure: 1,
					perAnswer: { ...view.gateStake.perAnswer, coveragePerWrong: -0.5 },
				},
			}),
		});

		expect(screen.getByText("wrong costs")).toBeInTheDocument();
		expect(screen.getByText("0.5")).toBeInTheDocument();
		expect(screen.getByText("Gate retry cost:")).toBeInTheDocument();
		expect(screen.getByText("Remove 1 config")).toBeInTheDocument();
	});

	it("badges a cost in the losing colour and the score in the winning one", () => {
		render_({
			view: createMockRunView({
				...view,
				gateStake: {
					...view.gateStake,
					peelSlotsOnFailure: 1,
					perAnswer: { ...view.gateStake.perAnswer, coveragePerWrong: -0.5 },
				},
			}),
		});

		expect(screen.getByText("0.5").parentElement).toHaveClass("bg-cinnabar/15");
		expect(screen.getByText("Remove 1 config").parentElement).toHaveClass(
			"bg-cinnabar/15"
		);
		expect(scoreChip().parentElement).toHaveClass("bg-celadon/15");
	});

	it("names the whole run as the cost once a miss is fatal", () => {
		render_({
			view: createMockRunView({
				...view,
				gateStake: {
					...view.gateStake,
					peelSlotsOnFailure: 2,
					missIsFatal: true,
				},
			}),
		});

		expect(screen.getByText("The run ends here")).toBeInTheDocument();
		expect(screen.queryByText(/Remove/)).not.toBeInTheDocument();
	});

	it("says the gate mirrors its polls, since the question reads inverted", () => {
		render_({ view: createMockRunView({ ...view, mirroredPolls: true }) });

		expect(screen.getByText(/pick every INCORRECT option/)).toBeInTheDocument();
	});

	it("says what a config does without a shop's sell price, which cannot be taken here", () => {
		render_();

		expect(screen.queryByText(/sells for/)).not.toBeInTheDocument();
		expect(
			screen.getByText(/TS polls pay 1.25× coverage./)
		).toBeInTheDocument();
	});
});

describe("PollView tools", () => {
	it("sells the cross-out from the linter's own row", async () => {
		const onLint = vi.fn();
		render_({
			view: createMockRunView({
				...view,
				configs: [CONFIGS.eslint],
				paidActions: {
					...view.paidActions,
					canLint: true,
					lintReady: true,
					lintCost: 8,
					linter: CONFIGS.eslint,
				},
			}),
			onLint,
		});

		await userEvent.click(
			screen.getByRole("button", { name: "cross out ESLint 8 KB" })
		);

		expect(onLint).toHaveBeenCalledOnce();
	});

	it("shows the fee, refuses the press, and names the shortfall on the button", () => {
		render_({
			view: createMockRunView({
				...view,
				configs: [CONFIGS.eslint],
				paidActions: {
					...view.paidActions,
					canLint: true,
					lintReady: false,
					lintCost: 16,
					linter: CONFIGS.eslint,
				},
				storage: 8,
			}),
		});

		expect(
			screen.getByRole("button", {
				name: "cross out ESLint 16 KB, Costs 16KB — you have 8KB",
			})
		).toBeDisabled();
	});

	it("repeats the shortfall where a hover can read it, not only on the press", () => {
		render_({
			view: createMockRunView({
				...view,
				configs: [CONFIGS.eslint],
				paidActions: {
					...view.paidActions,
					canLint: true,
					lintReady: false,
					lintCost: 16,
					linter: CONFIGS.eslint,
				},
				storage: 8,
			}),
		});

		expect(
			screen.getByText(/ESLint · cross out 16 KB · Costs 16KB — you have 8KB/)
		).toBeInTheDocument();
	});

	it("leaves an affordable tool unqualified", () => {
		render_({
			view: createMockRunView({
				...view,
				configs: [CONFIGS.eslint],
				paidActions: {
					...view.paidActions,
					canLint: true,
					lintReady: true,
					lintCost: 8,
					linter: CONFIGS.eslint,
				},
				storage: 64,
			}),
		});

		expect(screen.queryByText(/^Costs/)).not.toBeInTheDocument();
	});

	it("offers no tool on a build that sells none", () => {
		render_();

		expect(
			screen.queryByRole("button", { name: /cross out/ })
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /peek/ })
		).not.toBeInTheDocument();
	});

	it("takes the tool away while an audit has its config offline", () => {
		render_({
			view: createMockRunView({
				...view,
				configs: [CONFIGS.eslint],
				paidActions: {
					...view.paidActions,
					canLint: true,
					lintReady: true,
					lintCost: 8,
					linter: CONFIGS.eslint,
				},
				offlineConfigs: [
					{ config: CONFIGS.eslint, audit: "424 Failed Dependency" },
				],
			}),
		});

		expect(
			screen.queryByRole("button", { name: /cross out/ })
		).not.toBeInTheDocument();
		expect(
			screen.getByText(/ESLint · offline · 424 Failed Dependency/)
		).toBeInTheDocument();
	});

	it("reads the bought split onto the options it describes", () => {
		render_({ splitByOptionId: { "option-1": 57, "option-2": 29 } });

		expect(screen.getByText("57% picked this")).toBeInTheDocument();
		expect(screen.getByText("29% picked this")).toBeInTheDocument();
	});

	it("keeps the cross-out on an option the split also covers", () => {
		render_({
			view: createMockRunView({ ...view, disabledOptionIds: ["option-2"] }),
			splitByOptionId: { "option-2": 29 },
		});

		expect(screen.getByText("crossed out")).toBeInTheDocument();
		expect(screen.queryByText("29% picked this")).not.toBeInTheDocument();
	});

	it("opens on a folded track, since a narrow screen owes the question its height", () => {
		render_();

		expect(screen.getByRole("button", { name: /build/i })).toHaveAttribute(
			"aria-expanded",
			"false"
		);
	});

	it("unfolds the track and folds it back on the press", async () => {
		render_();

		const press = screen.getByRole("button", { name: /build/i });

		await userEvent.click(press);
		expect(press).toHaveAttribute("aria-expanded", "true");

		await userEvent.click(press);
		expect(press).toHaveAttribute("aria-expanded", "false");
	});

	it("states the gate's coverage in the header, where no fold can take it away", () => {
		render_();

		expect(screen.getByRole("progressbar")).toBeInTheDocument();
		expect(screen.getByText("Coverage")).toBeInTheDocument();
	});
});
