import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { AnsweredPoll } from "~/modules/run/run/domain/run.model";
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
		expect(screen.getByText("Timeout")).toBeInTheDocument();
	});

	// The mark and the word carry the state; dimming the row would have cost the
	// config its name, which is the thing the player is looking for.
	it("keeps an offline config on the rail, named and readable", () => {
		const { container } = render_({
			view: createMockRunView({ ...view, offlineConfigs: [CONFIGS.ts] }),
		});

		expect(screen.getByText("offline")).toBeInTheDocument();
		expect(screen.getByText(".ts")).toBeInTheDocument();
		expect(container.querySelector(".opacity-50")).not.toBeInTheDocument();
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

		expect(screen.getByText(/It ends the run\./)).toBeInTheDocument();
	});

	it("says the gate mirrors its polls, since the question reads inverted", () => {
		render_({ view: createMockRunView({ ...view, mirroredPolls: true }) });

		expect(screen.getByText(/pick every INCORRECT option/)).toBeInTheDocument();
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
				canLint: true,
				lintReady: true,
				lintCost: 8,
				linter: CONFIGS.eslint,
			}),
			onLint,
		});

		await userEvent.click(
			screen.getByRole("button", { name: "cross out ESLint 8 KB" })
		);

		expect(onLint).toHaveBeenCalledOnce();
	});

	it("shows the fee but refuses the press once the effect is spent", () => {
		render_({
			view: createMockRunView({
				...view,
				configs: [CONFIGS.eslint],
				canLint: true,
				lintReady: false,
				lintCost: 16,
				linter: CONFIGS.eslint,
			}),
		});

		expect(
			screen.getByRole("button", { name: "cross out ESLint 16 KB" })
		).toBeDisabled();
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
				canLint: true,
				lintReady: true,
				lintCost: 8,
				linter: CONFIGS.eslint,
				offlineConfigs: [CONFIGS.eslint],
			}),
		});

		expect(
			screen.queryByRole("button", { name: /cross out/ })
		).not.toBeInTheDocument();
		expect(screen.getByText("offline")).toBeInTheDocument();
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
});
