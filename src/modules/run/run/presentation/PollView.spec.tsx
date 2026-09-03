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

const optionButton = (label: string) =>
	screen.getByText(label).closest("button");

describe("PollView", () => {
	it("redacts the category under 404 rather than naming it", () => {
		render_({ view: createMockRunView({ ...view, categoryHidden: true }) });

		expect(screen.getByText("???")).toBeInTheDocument();
		expect(screen.queryByText("TypeScript")).not.toBeInTheDocument();
	});

	it("wears the gate it is being played at", () => {
		render_();

		expect(screen.getByText("Gate 4 · Lavender")).toBeInTheDocument();
	});

	it("draws one crumb per poll in the window, whatever has been answered", () => {
		render_();

		const trail = screen.getByRole("navigation");
		for (const crumb of ["1", "2", "3", "4", "5"]) {
			expect(within(trail).getByText(crumb)).toBeInTheDocument();
		}
	});

	// The dot colour is the only at-a-glance read of how the window is going.
	it("marks the answered polls with their real verdicts", () => {
		render_();

		expect(screen.getByText("correct")).toBeInTheDocument();
		expect(screen.getByText("wrong")).toBeInTheDocument();
	});

	it("prices the poll by its own difficulty, not the gate's", () => {
		render_();

		expect(screen.getByText("3 options")).toBeInTheDocument();
		expect(screen.getByText("scores")).toBeInTheDocument();
	});

	it("says a multi-answer poll takes more than one pick", () => {
		render_({
			poll: createMockPollView({ ...poll, answerType: "multiple" }),
		});

		expect(screen.getByText("pick every correct one")).toBeInTheDocument();
	});

	it("reports each pick as the player makes it", async () => {
		const onSelect = vi.fn();
		render_({ onSelect });

		await userEvent.click(screen.getByText("arr.splice(-2)"));

		expect(onSelect).toHaveBeenCalledWith("option-2");
	});

	it("marks the picked option as pressed", () => {
		render_({ selectedOptionIds: ["option-3"] });

		expect(optionButton("arr.at(-2)")).toHaveAttribute("aria-pressed", "true");
		expect(optionButton("arr.slice(-2)")).toHaveAttribute(
			"aria-pressed",
			"false"
		);
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
			screen.getByRole("button", { name: "Submit answer" })
		);

		expect(onSubmit).toHaveBeenCalledOnce();
	});

	it("crosses an eliminated option out rather than removing it", () => {
		render_({
			view: createMockRunView({ ...view, disabledOptionIds: ["option-2"] }),
		});

		expect(screen.getByText("arr.splice(-2)")).toBeInTheDocument();
		expect(screen.getByText("crossed out")).toBeInTheDocument();
	});

	it("reads the bought split onto the options it describes", () => {
		render_({ splitByOptionId: { "option-1": 62, "option-2": 31 } });

		expect(screen.getByText("62% picked this")).toBeInTheDocument();
		expect(screen.getByText("31% picked this")).toBeInTheDocument();
	});

	// A cross-out changes what is pickable; a split only describes it.
	it("keeps the cross-out on an option the split also covers", () => {
		render_({
			view: createMockRunView({ ...view, disabledOptionIds: ["option-2"] }),
			splitByOptionId: { "option-2": 31 },
		});

		expect(screen.getByText("crossed out")).toBeInTheDocument();
		expect(screen.queryByText("31% picked this")).not.toBeInTheDocument();
	});

	it("says the gate mirrors its polls, since the question reads inverted", () => {
		render_({ view: createMockRunView({ ...view, mirroredPolls: true }) });

		expect(screen.getByText(/pick every INCORRECT option/)).toBeInTheDocument();
	});
});

describe("PollView audits", () => {
	const audited = createMockRunView({
		...view,
		audits: [
			{
				id: "strip-1",
				code: 410,
				name: "Gone",
				description: "A miss peels 5.",
				suppressed: false,
			},
			{
				id: "mirrored",
				code: 300,
				name: "Multiple Choices",
				description: "Pick every wrong option.",
				suppressed: false,
			},
		],
	});

	it("gives every live audit its own alert, code and name apart", () => {
		render_({ view: audited });

		expect(screen.getByText("410")).toBeInTheDocument();
		expect(screen.getByText("Gone")).toBeInTheDocument();
		expect(screen.getByText("300")).toBeInTheDocument();
		expect(screen.getByText("Multiple Choices")).toBeInTheDocument();
	});
});

describe("PollView build rail", () => {
	it("keeps an offline config on the rail, named and blamed", () => {
		render_({
			view: createMockRunView({
				...view,
				offlineConfigs: [
					{ config: CONFIGS.ts, audit: "424 Failed Dependency" },
				],
			}),
		});

		expect(screen.getByText(".ts")).toBeInTheDocument();
		expect(
			screen.getByText(/offline · 424 Failed Dependency/)
		).toBeInTheDocument();
	});

	// The rail should read as what is actually working, so everything skipped
	// folds away behind a count and only names itself when asked for.
	it("folds the configs this poll skips behind a counted summary", () => {
		render_();

		expect(screen.getByText("Skipped · 1")).toBeInTheDocument();
		expect(screen.getByText(".js")).not.toBeVisible();
	});

	it("names a skipped config and why it sits out once unfolded", async () => {
		render_();

		await userEvent.click(screen.getByText("Skipped · 1"));

		expect(screen.getByText(".js")).toBeVisible();
	});

	it("states the gate's coverage in the header", () => {
		render_();

		expect(screen.getAllByText("Coverage").length).toBeGreaterThan(0);
	});

	it("states the gate's answer count when a config counts them", () => {
		render_({
			view: createMockRunView({ ...view, correctAnswersThisGate: 3 }),
		});

		expect(
			screen.getByText("this gate holds 3 correct answers")
		).toBeInTheDocument();
	});

	it("counts the incorrect ones instead where the gate mirrors its polls", () => {
		render_({
			view: createMockRunView({
				...view,
				correctAnswersThisGate: 3,
				mirroredPolls: true,
			}),
		});

		expect(
			screen.getByText("this gate holds 3 incorrect answers")
		).toBeInTheDocument();
	});

	it("says nothing about the count when no config is counting", () => {
		render_();

		expect(screen.queryByText(/this gate holds/)).not.toBeInTheDocument();
	});

	// One facts line carries the whole stake, so the cost of a wrong answer and
	// the cost of missing the gate read together rather than as loose notices.
	it("prices a wrong answer and a missed gate on the facts line", () => {
		render_();

		expect(screen.getByText("wrong costs")).toBeInTheDocument();
		expect(screen.getByText("Gate retry cost:")).toBeInTheDocument();
		expect(screen.getByText(/^Remove \d+ slots?$/)).toBeInTheDocument();
	});

	// Nothing to remove means nothing to say about removing it.
	it("leaves the retry cost out when a miss peels nothing", () => {
		render_({
			view: createMockRunView({
				...view,
				gateStake: { ...view.gateStake, peelSlotsOnFailure: 0 },
			}),
		});

		expect(screen.queryByText("Gate retry cost:")).not.toBeInTheDocument();
	});

	it("names the whole run as the cost once a miss is fatal", () => {
		render_({
			view: createMockRunView({
				...view,
				gateStake: { ...view.gateStake, missIsFatal: true },
			}),
		});

		expect(screen.getByText("The run ends here")).toBeInTheDocument();
	});
});

describe("PollView tools", () => {
	const withLinter = createMockRunView({
		...view,
		configs: [CONFIGS.js, CONFIGS.eslint],
		storage: 500,
		paidActions: {
			...view.paidActions,
			canLint: true,
			linter: CONFIGS.eslint,
			lintCost: 16,
			lintReady: true,
		},
	});

	it("sells the cross-out from the linter's own row", async () => {
		const onLint = vi.fn();
		render_({ view: withLinter, onLint });

		const row = screen.getByText("ESLint").closest("div");
		if (!row) throw new Error("No ESLint row rendered");

		await userEvent.click(
			within(row).getByRole("button", { name: /cross out/ })
		);

		expect(onLint).toHaveBeenCalledOnce();
	});

	it("shows the fee and refuses the press when it cannot be paid", async () => {
		const onLint = vi.fn();
		render_({
			view: createMockRunView({
				...withLinter,
				storage: 4,
				paidActions: { ...withLinter.paidActions, lintReady: false },
			}),
			onLint,
		});

		const press = screen.getByRole("button", { name: /cross out/ });
		await userEvent.click(press);

		expect(press).toBeDisabled();
		expect(onLint).not.toHaveBeenCalled();
	});

	it("offers no tool on a build that sells none", () => {
		render_();

		expect(
			screen.queryByRole("button", { name: /cross out/ })
		).not.toBeInTheDocument();
	});

	it("takes the tool away while an audit has its config offline", () => {
		render_({
			view: createMockRunView({
				...withLinter,
				offlineConfigs: [{ config: CONFIGS.eslint, audit: "403 Forbidden" }],
			}),
		});

		expect(
			screen.queryByRole("button", { name: /cross out/ })
		).not.toBeInTheDocument();
	});
});
