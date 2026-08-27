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

describe("PollView", () => {
	it("wears the gate it is being played at", () => {
		render_();

		expect(
			screen.getByRole("heading", { name: "Gate 4 · Lavender" })
		).toBeInTheDocument();
	});

	// The trail is built from the window's size, so an early gate cannot look
	// shorter than it is.
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

		// The verdict is announced, not drawn — the dot carries the colour.
		expect(within(trail).getByText(/— correct/)).toBeInTheDocument();
		expect(within(trail).getByText(/— wrong/)).toBeInTheDocument();
		expect(trail.querySelector('[aria-current="step"]')).toHaveTextContent("3");
	});

	it("prices the poll by its own difficulty, not the gate's", () => {
		render_();

		expect(screen.getByText("3 options")).toBeInTheDocument();
		expect(screen.getByText(/scores ×/)).toBeInTheDocument();
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

	// A lint cross-out is information, so the option stays visible and says why.
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
						name: "Timeout",
						description: "On the clock.",
						suppressed: false,
					},
				],
			}),
		});

		expect(screen.getByText("1 audit")).toBeInTheDocument();
		// Twice on purpose: the header names what is running, the rail says what
		// it does to this poll.
		expect(screen.getAllByText("Timeout")).toHaveLength(2);
		expect(screen.getByText("On the clock.")).toBeInTheDocument();
	});

	it("counts the gate's live audits on the rail", () => {
		render_({
			view: createMockRunView({
				...view,
				audits: [
					{
						id: "strip-1",
						name: "Strip",
						description: "A miss peels 5.",
						suppressed: false,
					},
					{
						id: "mirrored",
						name: "Mirror",
						description: "Pick every wrong option.",
						suppressed: false,
					},
				],
			}),
		});

		expect(screen.getByText("2 running")).toBeInTheDocument();
	});

	// The dot and the word carry the state; dimming the row would have cost the
	// config its name, which is the thing the player is looking for.
	it("keeps an offline config on the rail, named and readable", () => {
		const { container } = render_({
			view: createMockRunView({
				...view,
				offlineConfigs: [{ config: CONFIGS.ts, audit: "Dependency Outage" }],
			}),
		});

		expect(screen.getByText(".ts")).toHaveClass("line-through");
		expect(container.querySelector(".opacity-50")).not.toBeInTheDocument();
	});

	it("blames the audit by name rather than reporting a dead row", () => {
		render_({
			view: createMockRunView({
				...view,
				offlineConfigs: [{ config: CONFIGS.ts, audit: "Dependency Outage" }],
			}),
		});

		expect(screen.getByText("offline · Dependency Outage")).toBeInTheDocument();
	});

	// The faucet's rate never moves, so the run's remaining allowance is the only
	// number on the row that answers "how much of this is left".
	it("counts the run's faucet allowance down on the config earning it", () => {
		render_({
			view: createMockRunView({
				...view,
				configs: [CONFIGS.indexedDb],
				faucetRemainingKb: 216,
			}),
		});

		expect(screen.getByText("216 KB left")).toBeInTheDocument();
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

	// `.length`'s whole effect, and it had none: the count reached the view and no
	// modern screen read it.
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

	it("warns on the stake when a miss would take the whole build", () => {
		render_({
			view: createMockRunView({
				...view,
				gateStake: {
					...view.gateStake,
					stripsOnFailure: 2,
					missIsFatal: true,
				},
			}),
		});

		expect(
			screen.getByText("your whole pipeline — the run ends here")
		).toBeInTheDocument();
	});

	it("says the gate mirrors its polls, since the question reads inverted", () => {
		render_({ view: createMockRunView({ ...view, mirroredPolls: true }) });

		expect(screen.getByText(/pick every INCORRECT option/)).toBeInTheDocument();
	});

	// The row wears the stripe; only the opened facts line can spell the grade
	// out, so it leads with it and then states level, rate and refund.
	it("states the grade, the level, the rate and the refund under a config", () => {
		render_();

		// Both equipped configs are common `.js`/`.ts` Focus configs, so every
		// facts line on the rail reads alike; the first stands for them.
		const facts = screen.getAllByText(/sells for/)[0];

		expect(facts?.textContent).toBe(
			"common · level 1 · ×1.25 · sells for 16 KB"
		);
		// The stripe on the row says "common" too, for a reader; the facts line's
		// copy is the visible one, and it wears the tier's colour.
		const word = screen
			.getAllByText("common")
			.find((node) => !node.className.includes("sr-only"));
		expect(word).toHaveClass("text-cerulean");
	});

	// "level 1" implies a level 2, so a config with no ladder does not claim one.
	it("leaves the level off a config that cannot be upgraded", () => {
		render_({
			view: createMockRunView({ ...view, configs: [CONFIGS.eslint] }),
		});

		const facts = screen.getAllByText(/sells for/)[0];

		expect(facts?.textContent).not.toContain("level");
	});

	it("quotes the refund this build would actually be paid, not list price", () => {
		// WTFPL's no-warranty clause zeroes every sale while it is installed.
		render_({
			view: createMockRunView({
				...view,
				configs: [CONFIGS.js, CONFIGS.wtfpl],
			}),
		});

		expect(screen.getAllByText(/sells for 0 KB/).length).toBeGreaterThan(0);
	});
});

describe("PollView tools", () => {
	// A paid effect hangs off the config that sells it, so the row names it.
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

	// `canLint` already means the tool applies to this poll — the config is
	// installed, the category matches, the audit has not frozen it and there is
	// still an option to cross out. So the pair "applies but not ready" can only
	// ever mean the run is short of KB, and the row says which.
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

	// A disabled button takes no taps at all, so a phone can never reach the
	// button's own tooltip: the row's body carries the same sentence.
	it("repeats the shortfall in the row body, which a tap can open", () => {
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

		// Twice on purpose: the button's tooltip panel and the row's own body. The
		// body is the facts line, which is the copy a tap can reach — the refusal
		// closes it, after the grade, the level, the rate and the refund.
		expect(screen.getByText("Costs 16KB — you have 8KB")).toBeInTheDocument();

		const facts = screen.getByText(/sells for/);
		expect(facts.tagName).toBe("P");
		expect(facts.textContent).toContain("Costs 16KB — you have 8KB");
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
					{ config: CONFIGS.eslint, audit: "Dependency Outage" },
				],
			}),
		});

		expect(
			screen.queryByRole("button", { name: /cross out/ })
		).not.toBeInTheDocument();
		expect(screen.getByText("offline · Dependency Outage")).toBeInTheDocument();
	});

	it("reads the bought split onto the options it describes", () => {
		render_({ splitByOptionId: { "option-1": 57, "option-2": 29 } });

		expect(screen.getByText("57% picked this")).toBeInTheDocument();
		expect(screen.getByText("29% picked this")).toBeInTheDocument();
	});

	// A crossed-out option is a rule, not a statistic; the rule has to survive.
	it("keeps the cross-out on an option the split also covers", () => {
		render_({
			view: createMockRunView({ ...view, disabledOptionIds: ["option-2"] }),
			splitByOptionId: { "option-2": 29 },
		});

		expect(screen.getByText("crossed out")).toBeInTheDocument();
		expect(screen.queryByText("29% picked this")).not.toBeInTheDocument();
	});

	// The fold is the adapter's to remember: the screen only reports the press,
	// and the run state has no business carrying a reading preference.
	it("folds the rail away and back on the toggle", async () => {
		render_();

		expect(screen.getByText("Pipeline")).toBeInTheDocument();

		await userEvent.click(
			screen.getByRole("button", { name: "Fold run info" })
		);

		expect(screen.queryByText("Pipeline")).not.toBeInTheDocument();

		await userEvent.click(
			screen.getByRole("button", { name: "Unfold run info" })
		);

		expect(screen.getByText("Pipeline")).toBeInTheDocument();
	});
});
