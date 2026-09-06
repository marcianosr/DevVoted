import type { Meta, StoryObj } from "@storybook/react";

import { RevealScreen } from "./RevealScreen.ui";

const noop = () => {};

const meta: Meta<typeof RevealScreen> = {
	component: RevealScreen,
	title: "Terminal/Screens/Reveal",
	parameters: { layout: "fullscreen" },
	decorators: [
		(Story) => (
			<div className="min-h-screen bg-zinc-900 p-6">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof RevealScreen>;

export const RightAnswer: Story = {
	args: {
		run: {
			title: "Gate 4 · Lavender",
			swatch: "lavender",
			balance: "102 KB balance",
			swatches: [
				{ theme: "pallet", state: "earned" },
				{ theme: "boulder", state: "earned" },
				{ theme: "cascade", state: "earned" },
				{ theme: "volcano", state: "earned" },
				{ theme: "lavender", state: "current" },
				...Array.from({ length: 8 }, () => ({ state: "locked" }) as const),
			],
			gateLabel: "gate 4 / 12",
			coverage: { label: "Coverage", reading: "31.1 / 60%", percent: 52 },
		},
		theme: "lavender",
		coverage: { held: 31.1, demand: 60, earned: 4.1 },
		build: {
			running: 2,
			total: { label: "Total", value: "×3.1" },
			rows: [
				{
					name: ".js",
					slots: 1,
					version: 1,
					detail: "JS polls ×1.25",
					dot: "on",
					figure: "paid +0.6",
				},
				{
					name: ".ts",
					slots: 1,
					version: 1,
					detail: "TS only",
					dot: "off",
					figure: "paid nothing",
				},
				{
					name: "Deprecated",
					slots: 4,
					version: 1,
					detail: "All coverage ×2.5",
					dot: "on",
					figure: "paid +1.9",
				},
			],
		},
		trail: { count: 5, current: 2, verdicts: ["correct", "correct"] },
		category: "JavaScript",
		facts: [
			{ label: "scores", value: "×1.1", tone: "celadon" },
			{ label: "wrong costs", value: "0.3", tone: "cinnabar" },
			{
				label: "Gate retry cost:",
				value: "Remove 1 config",
				hint: "1 slot of configs — drop them or minify them, your pick",
				tone: "cinnabar",
			},
		],
		question: "Which method returns the last element of an array?",
		choices: [
			{
				letter: "A",
				label: "at(−1)",
				state: "expected",
				note: "expected · you picked",
			},
			{ letter: "B", label: "pop()", state: "dimmed" },
			{ letter: "C", label: "last()", state: "dimmed" },
		],
		equation: {
			factors: [
				{ value: "1.0", label: "correct" },
				{ value: "1.1", label: "streak" },
				{ value: "3.1", label: "build", boxed: true },
			],
			result: "+3.1%",
			resultLabel: "coverage earned",
		},
		nextLabel: "Next poll →",
		onNext: noop,
		byline: { author: "@matthijsgroen" },
	},
};

// The track stays silent on a miss: configs never touch a loss, so no row says
// what it paid. The loss reads once, on the total.
export const WrongAnswer: Story = {
	args: {
		...RightAnswer.args,
		coverage: { held: 29.2, demand: 60, earned: -1.9 },
		trail: { count: 5, current: 2, verdicts: ["correct", "wrong"] },
		build: {
			running: 2,
			total: { label: "Total", value: "×3.1" },
			rows: [
				{
					name: ".js",
					slots: 1,
					version: 1,
					detail: "JS polls ×1.25",
					dot: "on",
				},
				{ name: ".ts", slots: 1, version: 1, detail: "TS only", dot: "off" },
				{
					name: "Deprecated",
					slots: 4,
					version: 1,
					detail: "All coverage ×2.5",
					dot: "on",
				},
			],
		},
		choices: [
			{ letter: "A", label: "at(−1)", state: "expected", note: "expected" },
			{ letter: "B", label: "pop()", state: "idle", note: "you picked" },
			{ letter: "C", label: "last()", state: "dimmed" },
		],
		equation: {
			factors: [],
			result: "−1.9%",
			resultLabel: "coverage lost",
			resultTone: "cinnabar",
		},
	},
};

export const Mobile: Story = {
	...RightAnswer,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};

export const EliteReveal: Story = {
	args: {
		audits: [
			{ code: "410", name: "Gone", cue: "a miss peels 5 configs, not 4" },
			{
				code: "426",
				name: "Upgrade Required",
				cue: "your lowest-version config is offline",
			},
			{ code: "403", name: "Forbidden", cue: "no linting, no peeking" },
		],

		run: {
			title: "Gate 12 · Elite",
			swatch: "elite",
			balance: "1.9 MB balance",
			swatches: [
				{ theme: "pallet", state: "earned" },
				{ theme: "boulder", state: "earned" },
				{ theme: "cascade", state: "earned" },
				{ theme: "thunder", state: "earned" },
				{ theme: "rainbow", state: "earned" },
				{ theme: "soul", state: "earned" },
				{ theme: "marsh", state: "earned" },
				{ theme: "volcano", state: "earned" },
				{ theme: "earth", state: "earned" },
				{ theme: "lavender", state: "earned" },
				{ theme: "seafoam", state: "earned" },
				{ theme: "elite", state: "current" },
				{ state: "locked" },
			],
			gateLabel: "gate 12 / 12",
			coverage: { label: "Coverage", reading: "64.4 / 85%", percent: 76 },
		},
		theme: "elite",
		coverage: { held: 64.4, demand: 85, earned: 12.4 },
		build: {
			running: 5,
			total: { label: "Total", value: "×6.2" },
			rows: [
				{
					name: ".js",
					slots: 1,
					version: 1,
					detail: "JS polls ×1.5",
					dot: "on",
					figure: "paid +0.9",
				},
				{
					name: ".ts",
					slots: 1,
					version: 1,
					detail: "TS only",
					dot: "off",
					figure: "paid nothing",
				},
				{
					name: ".py",
					slots: 1,
					version: 1,
					detail: "Python polls ×1.25",
					dot: "off",
					figure: "paid nothing",
				},
				{
					name: "ESLint",
					slots: 1,
					version: 1,
					detail: "Crossed out one answer",
					dot: "on",
					figure: "−64 KB",
				},
				{
					name: "Telemetry",
					slots: 2,
					version: 1,
					detail: "See the community split · 402 Payment Required stopped it",
					dot: "blocked",
					figure: "paid nothing",
				},
				{
					name: "Deprecated",
					slots: 4,
					version: 1,
					detail: "All coverage ×2.5",
					dot: "on",
					figure: "paid +3.4",
				},
				{
					name: "IndexedDB",
					slots: 2,
					version: 1,
					detail: "+8 KB an answer",
					dot: "on",
					figure: "+8 KB",
				},
				{
					name: "Overclock",
					slots: 4,
					version: 1,
					detail: "First answer ×4",
					dot: "on",
					figure: "×0.5 · already fired",
				},
			],
		},
		trail: {
			count: 5,
			current: 4,
			verdicts: ["correct", "wrong", "correct", "correct"],
		},
		category: "CSS",
		facts: [
			{ label: "scores", value: "×1.4", tone: "celadon" },
			{ label: "wrong costs", value: "0.9", tone: "cinnabar" },
			{
				label: "Gate retry cost:",
				value: "The run ends here",
				tone: "cinnabar",
			},
		],
		question: "Which property creates a new stacking context on its own?",
		choices: [
			{
				letter: "A",
				label: "isolation: isolate",
				state: "expected",
				note: "expected · you picked",
			},
			{ letter: "B", label: "z-index: 0", state: "dimmed" },
			{ letter: "C", label: "position: static", state: "dimmed" },
			{ letter: "D", label: "will-change: opacity", state: "dimmed" },
		],
		equation: {
			factors: [
				{ value: "1.0", label: "correct" },
				{ value: "1.4", label: "streak" },
				{ value: "6.2", label: "build", boxed: true },
			],
			result: "+8.7%",
			resultLabel: "coverage earned",
		},
		nextLabel: "Score the gate →",
		onNext: noop,
	},
};

export const EliteRevealMobile: Story = {
	...EliteReveal,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};
