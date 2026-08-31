import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { PollView } from "~/modules/run/run/application/pollView.viewmodel";
import { AnsweringScreen } from "~/modules/run/run/presentation/AnsweringScreen.ui";
import { createMockPollView } from "~/test/runView.factory";

const meta: Meta<typeof AnsweringScreen> = {
	component: AnsweringScreen,
	title: "Run/Screens/Answering",
};
export default meta;

type Story = StoryObj<typeof AnsweringScreen>;

/** Each story names only what it varies from this React single-answer poll. */
const poll = (overrides: Partial<PollView> = {}) =>
	createMockPollView({
		category: "react",
		question: "What is the correct key to give list items in React?",
		options: [
			{ id: "a", label: "A stable unique id" },
			{ id: "b", label: "The array index, always" },
			{ id: "c", label: "Math.random()" },
		],
		...overrides,
	});

export const Default: Story = {
	args: {
		configs: [CONFIGS.js, CONFIGS.coverageGain],
		poll: poll(),
		pollOutcomes: ["correct", "wrong"],
		pollsPerGate: 5,
		canSubmit: true,
		onSelect: () => {},
		onSubmit: () => {},
		onNext: () => {},
	},
};

/** The post-submit reveal: options show ✓/✕, the coverage equation pops in with
 *  real ConfigChips, and the CTA becomes "Next →" (the player advances). */
export const Revealed: Story = {
	args: {
		...Default.args,
		configs: [CONFIGS.js, CONFIGS.agentsMd],
		poll: poll({
			category: "js",
			question: "Which of these are valid ways to make a fetch cancellable?",
			answerType: "multiple",
			options: [
				{ id: "a", label: "AbortController + signal" },
				{ id: "b", label: "Ignoring the response if a newer request started" },
				{ id: "c", label: "Setting fetch's timeout: property" },
			],
		}),
		canSubmit: false,
		reveal: {
			correctOptionIds: ["a", "b"],
			chosenOptionIds: ["a", "c"],
			// Multipliers-last: AGENTS.md ×2 amplifies base + the .js boost, so its
			// chip is +1.5 (not +1.0). (1 + 0.5 .js) × 2 × 1.2 streak = 3.6.
			score: {
				isCorrect: true,
				baseCoverage: 1,
				streakBonus: 0.6,
				configBonuses: [
					{ configId: "js", value: 0.5 },
					{ configId: "agents-md", value: 1.5 },
				],
				earnedCoverage: 3.6,
			},
		},
	},
};

/**
 * The mirror rewrites the question (ADR-038): the instruction sits on the card
 * with the options, and a single-answer poll has become a select-all.
 */
export const MirroredGate: Story = {
	args: {
		...Default.args,
		poll: poll({ answerType: "multiple" }),
		audits: [
			{
				id: "mirrored",
				name: "Mirror",
				description:
					"Every poll asks for the INCORRECT options instead — pick all of them.",
				answerCue:
					"Mirrored: pick every WRONG option. A single-answer poll usually has several.",
				suppressed: false,
			},
		],
		mirroredPolls: true,
	},
};

/** A dependency down: the cue announces it, the line beneath names it. */
export const OutageGate: Story = {
	args: {
		...Default.args,
		audits: [
			{
				id: "dependency-outage",
				name: "Dependency Outage",
				description:
					"One config in your build goes offline for the whole attempt — its effect does nothing.",
				answerCue:
					"A dependency is down: one of your configs is offline this gate.",
				suppressed: false,
			},
		],
		offlineConfigs: [CONFIGS.eslint],
	},
};

/** The clock, mid-poll: pressure as a chip beside the cue, never a headline. */
export const TimedGate: Story = {
	args: {
		...Default.args,
		audits: [
			{
				id: "timeout-3",
				name: "Timeout",
				description:
					"The first 3 polls are on a 30s clock — an answer over the limit scores as a miss.",
				answerCue: "On the clock: 30s to answer, or it counts as a miss.",
				suppressed: false,
			},
		],
		clock: { limitMs: 30_000, remainingMs: 21_000 },
	},
};

/** The last seconds, where the clock is the loudest thing on the screen. */
export const TimeRunningOut: Story = {
	args: {
		...TimedGate.args,
		clock: { limitMs: 30_000, remainingMs: 4_000 },
	},
};

/** Two audits down two configs at once — the line reads as one list. */
export const RollingOutageGate: Story = {
	args: {
		...Default.args,
		audits: [
			{
				id: "rolling-outage",
				name: "Rolling Outage",
				description:
					"The outage rolls through your build: a different config is down for each poll of the window.",
				answerCue: "Rolling outage: the config that is down moves every poll.",
				suppressed: false,
			},
		],
		offlineConfigs: [CONFIGS.coverageGain],
	},
};
