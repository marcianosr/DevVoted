import type { Meta, StoryObj } from "@storybook/react";

import { PollScreen, type PollScreenProps } from "./PollScreen.ui";

const noop = () => {};

const meta: Meta<typeof PollScreen> = {
	component: PollScreen,
	title: "Terminal/Screens/Poll",
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
type Story = StoryObj<typeof PollScreen>;

const secondPoll: PollScreenProps = {
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
		coverage: { label: "Coverage", reading: "28 / 60%", percent: 46 },
	},
	theme: "lavender",
	build: {
		running: 1,
		total: { label: "Total", value: "×1.25" },
		rows: [
			{
				name: ".js",
				slots: 1,
				version: 1,
				detail: "JS polls ×1.25",
				dot: "on",
				figure: "×1.25",
			},
			{
				name: ".ts",
				slots: 1,
				version: 1,
				detail: "TS only",
				dot: "off",
			},
			{
				name: "Deprecated",
				slots: 4,
				version: 1,
				detail: "All coverage ×2.5 · gone in 3 clears",
				dot: "blocked",
			},
			{
				name: "ESLint",
				slots: 1,
				version: 1,
				detail: "Cross out a wrong answer",
				dot: "action",
				use: { label: "use", price: "16 KB", onUse: noop },
			},
		],
	},
	audits: [
		{ code: "424", name: "Failed Dependency", cue: "Deprecated is offline" },
	],
	trail: { count: 5, current: 2 },
	category: "JavaScript",
	question: "Which method returns the last element of an array?",
	facts: [
		{ label: "scores", value: "×1.1", tone: "celadon" },
		{ label: "3 options" },
		{ label: "wrong costs", value: "0.3", tone: "cinnabar" },
		{
			label: "Gate retry cost:",
			value: "Remove 1 config",
			hint: "1 slot of configs — drop them or minify them, your pick",
			tone: "cinnabar",
		},
	],
	byline: { author: "@matthijsgroen" },
	choices: [
		{ letter: "A", label: "at(−1)" },
		{ letter: "B", label: "pop()" },
		{ letter: "C", label: "last()" },
	],
	onToggle: noop,
	submitLabel: "Submit answer",
	submitLock: "Pick an answer",
};

export const SecondPoll: Story = { args: secondPoll };

export const Picked: Story = {
	args: {
		...secondPoll,
		choices: [
			{ letter: "A", label: "at(−1)", selected: true },
			{ letter: "B", label: "pop()" },
			{ letter: "C", label: "last()" },
		],
		submitLock: undefined,
		onSubmit: noop,
	},
};

export const MultiplePicked: Story = {
	args: {
		...secondPoll,
		question: "Which of these mutate the array they are called on?",
		facts: [
			{ label: "scores", value: "×1.4", tone: "celadon" },
			{ label: "4 options" },
			{ label: "pick every correct one" },
		],
		choices: [
			{ letter: "A", label: "sort()", selected: true },
			{ letter: "B", label: "map()" },
			{ letter: "C", label: "splice()", selected: true },
			{ letter: "D", label: "slice()" },
		],
		submitLock: undefined,
		onSubmit: noop,
	},
};

export const ToolsUsed: Story = {
	args: {
		...secondPoll,
		facts: [
			{ label: "scores", value: "×1.1", tone: "celadon" },
			{ label: "3 options" },
			{ label: "ESLint crossed one out" },
		],
		choices: [
			{ letter: "A", label: "at(−1)", note: "62% picked this" },
			{ letter: "B", label: "pop()", note: "31% picked this" },
			{
				letter: "C",
				label: "last()",
				state: "crossedOut",
				note: "crossed out",
			},
		],
		submitLock: undefined,
		onSubmit: noop,
	},
};

export const CodePoll: Story = {
	args: {
		...secondPoll,
		category: "TypeScript",
		question: "What does this log?",
		facts: [{ label: "scores", value: "×1.1", tone: "celadon" }],
		code: ["const xs = [1, 2, 3] as const;", "", "console.log(xs.at(-1));", ""],
		choices: [
			{ letter: "A", label: "3" },
			{ letter: "B", label: "undefined" },
			{ letter: "C", label: "a type error" },
		],
	},
};

export const TenConfigBuild: Story = {
	args: {
		...secondPoll,
		build: {
			running: 7,
			total: { label: "Total", value: "×3.1" },
			rows: [
				{
					name: ".js",
					slots: 1,
					version: 1,
					detail: "JS polls ×1.25",
					dot: "on",
					figure: "×1.25",
				},
				{
					name: ".ts",
					slots: 1,
					version: 1,
					detail: "TS only",
					dot: "off",
				},
				{
					name: ".jsx",
					slots: 1,
					version: 1,
					detail: "React polls ×1.25",
					dot: "on",
					figure: "×1.25",
				},
				{
					name: "ESLint",
					slots: 1,
					version: 1,
					detail: "Cross out a wrong answer",
					dot: "action",
					use: { label: "use", price: "16 KB", onUse: noop },
				},
				{
					name: "Telemetry",
					slots: 2,
					version: 1,
					detail: "See the community split · fee doubles",
					dot: "on",
					figure: "×1.1",
				},
				{
					name: "Deprecated",
					slots: 4,
					version: 1,
					detail: "All coverage ×2.5 · gone in 3 clears",
					dot: "on",
					figure: "×2.5",
				},
				{
					name: "Cold Start",
					slots: 2,
					version: 1,
					detail: "The gate's first answer ×2 · fired already",
					dot: "off",
				},
				{
					name: "IndexedDB",
					slots: 2,
					version: 1,
					detail: "+8 KB an answer · 96 of 320",
					dot: "on",
					meterPercent: 30,
				},
				{
					name: "Moore's Law",
					slots: 1,
					version: 1,
					detail: "+2% of held storage a clear",
					dot: "on",
					figure: "+2%",
				},
				{
					name: "Overclock",
					slots: 4,
					version: 1,
					detail: "First answer ×4, every later one ×0.5",
					dot: "on",
					figure: "×0.5",
				},
			],
		},
	},
};

export const Mobile: Story = {
	...SecondPoll,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};

export const EliteGate: Story = {
	args: {
		...secondPoll,
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
			coverage: { label: "Coverage", reading: "58.2 / 85%", percent: 68 },
		},
		theme: "elite",
		build: {
			running: 6,
			total: { label: "Total", value: "×6.2" },
			rows: [
				{
					name: ".js",
					slots: 1,
					version: 1,
					detail: "JS polls ×1.5",
					dot: "on",
					figure: "×1.5",
				},
				{
					name: ".ts",
					slots: 1,
					version: 1,
					detail: "TS only",
					dot: "off",
				},
				{
					name: ".jsx",
					slots: 1,
					version: 1,
					detail: "React polls ×1.25",
					dot: "on",
					figure: "×1.25",
				},
				{
					name: "ESLint",
					slots: 1,
					version: 1,
					detail: "Cross out a wrong answer",
					dot: "action",
					use: { label: "use", price: "64 KB", onUse: noop },
				},
				{
					name: "Telemetry",
					slots: 2,
					version: 1,
					detail: "See the community split · 402 Payment Required stopped it",
					dot: "blocked",
				},
				{
					name: "Deprecated",
					slots: 4,
					version: 1,
					detail: "All coverage ×2.5 · gone in 3 clears",
					dot: "on",
					figure: "×2.5",
				},
				{
					name: "Cold Start",
					slots: 2,
					version: 1,
					detail: "The gate's first answer ×2 · fired already",
					dot: "off",
				},
				{
					name: "IndexedDB",
					slots: 2,
					version: 1,
					detail: "+8 KB an answer · 288 of 320",
					dot: "on",
					meterPercent: 90,
				},
				{
					name: "Moore's Law",
					slots: 1,
					version: 1,
					detail: "+2% of held storage a clear",
					dot: "on",
					figure: "+2%",
				},
				{
					name: "Overclock",
					slots: 4,
					version: 1,
					detail: "First answer ×4, every later one ×0.5",
					dot: "on",
					figure: "×0.5",
				},
			],
		},
		trail: { count: 5, current: 4 },
		category: "CSS",
		question: "Which property creates a new stacking context on its own?",
		choices: [
			{ letter: "A", label: "isolation: isolate" },
			{ letter: "B", label: "z-index: 0" },
			{ letter: "C", label: "position: static" },
			{ letter: "D", label: "will-change: opacity" },
		],
	},
};

export const EliteGateMobile: Story = {
	...EliteGate,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};
