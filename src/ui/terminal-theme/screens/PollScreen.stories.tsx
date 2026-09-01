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
		coverage: { label: "coverage", reading: "28 / 60%", percent: 46 },
	},
	theme: "lavender",
	build: {
		meta: "4",
		total: { label: "this answer", value: "×1.25" },
		rows: [
			{
				name: ".js",
				detail: "JS polls ×1.25",
				dot: "on",
				figure: "×1.25",
			},
			{
				name: ".ts",
				detail: "TS only",
				dot: "off",
			},
			{
				name: "Deprecated",
				detail: "All coverage ×2.5 · gone in 3 clears",
				dot: "blocked",
			},
			{
				name: "ESLint",
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
	choices: [
		{ letter: "A", label: "at(−1)" },
		{ letter: "B", label: "pop()" },
		{ letter: "C", label: "last()" },
	],
	onPick: noop,
	pickLabel: "Pick an answer",
};

export const SecondPoll: Story = { args: secondPoll };

export const TenConfigBuild: Story = {
	args: {
		...secondPoll,
		build: {
			meta: "10",
			total: { label: "this answer", value: "×3.1" },
			rows: [
				{
					name: ".js",
					detail: "JS polls ×1.25",
					dot: "on",
					figure: "×1.25",
				},
				{
					name: ".ts",
					detail: "TS only",
					dot: "off",
				},
				{
					name: ".jsx",
					detail: "React polls ×1.25",
					dot: "on",
					figure: "×1.25",
				},
				{
					name: "ESLint",
					detail: "Cross out a wrong answer",
					dot: "action",
					use: { label: "use", price: "16 KB", onUse: noop },
				},
				{
					name: "Telemetry",
					detail: "See the community split · fee doubles",
					dot: "on",
					figure: "×1.1",
				},
				{
					name: "Deprecated",
					detail: "All coverage ×2.5 · gone in 3 clears",
					dot: "on",
					figure: "×2.5",
				},
				{
					name: "Cold Start",
					detail: "The gate's first answer ×2 · fired already",
					dot: "off",
				},
				{
					name: "IndexedDB",
					detail: "+8 KB an answer · 96 of 320",
					dot: "on",
					meterPercent: 30,
				},
				{
					name: "Moore's Law",
					detail: "+2% of held storage a clear",
					dot: "on",
					figure: "+2%",
				},
				{
					name: "Overclock",
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
			coverage: { label: "coverage", reading: "58.2 / 85%", percent: 68 },
		},
		theme: "elite",
		build: {
			meta: "10",
			total: { label: "this answer", value: "×6.2" },
			rows: [
				{
					name: ".js",
					detail: "JS polls ×1.5",
					dot: "on",
					figure: "×1.5",
				},
				{
					name: ".ts",
					detail: "TS only",
					dot: "off",
				},
				{
					name: ".jsx",
					detail: "React polls ×1.25",
					dot: "on",
					figure: "×1.25",
				},
				{
					name: "ESLint",
					detail: "Cross out a wrong answer",
					dot: "action",
					use: { label: "use", price: "64 KB", onUse: noop },
				},
				{
					name: "Telemetry",
					detail: "See the community split · 402 Payment Required stopped it",
					dot: "blocked",
				},
				{
					name: "Deprecated",
					detail: "All coverage ×2.5 · gone in 3 clears",
					dot: "on",
					figure: "×2.5",
				},
				{
					name: "Cold Start",
					detail: "The gate's first answer ×2 · fired already",
					dot: "off",
				},
				{
					name: "IndexedDB",
					detail: "+8 KB an answer · 288 of 320",
					dot: "on",
					meterPercent: 90,
				},
				{
					name: "Moore's Law",
					detail: "+2% of held storage a clear",
					dot: "on",
					figure: "+2%",
				},
				{
					name: "Overclock",
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
