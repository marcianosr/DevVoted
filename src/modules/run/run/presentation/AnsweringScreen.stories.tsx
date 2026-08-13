import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { AnsweringScreen } from "~/modules/run/run/presentation/AnsweringScreen.ui";

const meta: Meta<typeof AnsweringScreen> = {
	component: AnsweringScreen,
	title: "Run/Screens/Answering",
};
export default meta;

type Story = StoryObj<typeof AnsweringScreen>;

export const Default: Story = {
	args: {
		configs: [CONFIGS.js, CONFIGS.coverageGain],
		checks: [
			{
				label: "Correct",
				progress: { kind: "answers", current: 1, target: 2 },
				current: 1,
				target: 2,
				state: "running",
				sourceConfigId: "unit-tests",
			},
			{
				label: "Coverage",
				progress: { kind: "coverage", current: 2, target: 4 },
				current: 2,
				target: 4,
				state: "running",
				sourceConfigId: "coverage-gain",
			},
		],
		category: "react",
		question: "What is the correct key to give list items in React?",
		answerType: "single",
		options: [
			{ id: "a", label: "A stable unique id" },
			{ id: "b", label: "The array index, always" },
			{ id: "c", label: "Math.random()" },
		],
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
		category: "js",
		question: "Which of these are valid ways to make a fetch cancellable?",
		answerType: "multiple",
		options: [
			{ id: "a", label: "AbortController + signal" },
			{ id: "b", label: "Ignoring the response if a newer request started" },
			{ id: "c", label: "Setting fetch's timeout: property" },
		],
		correctOptionIds: ["a", "b"],
		chosenOptionIds: ["a", "c"],
		canSubmit: false,
		// Multipliers-last: AGENTS.md ×2 amplifies base + the .js boost, so its chip
		// is +1.5 (not +1.0). (1 + 0.5 .js) × 2 × 1.2 streak = 3.6.
		revealScore: {
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
};
