import type { Meta, StoryObj } from "@storybook/react";

import { PrepScreen } from "./PrepScreen.ui";

const noop = () => {};

const meta: Meta<typeof PrepScreen> = {
	component: PrepScreen,
	title: "Terminal/Screens/Prep",
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
type Story = StoryObj<typeof PrepScreen>;

export const BeforeLavender: Story = {
	args: {
		header: {
			title: "Gate 4 · Lavender",
			subtitle: "1 audit · 402 Payment Required",
			swatch: "lavender",
			value: "102 KB",
			caption: "balance",
		},
		theme: "lavender",
		ready: {
			note: "today's 5 polls are ready",
			startLabel: "Start Lavender →",
			onStart: noop,
		},
		build: {
			meta: "7 of 8 slots",
			count: "4",
			slots: 8,
			rows: [
				{
					family: "focus",
					name: ".js",
					slots: 1,
					detail: "JS polls ×1.25",
					version: "v1",
				},
				{
					family: "defense",
					name: "ESLint",
					slots: 1,
					detail: "Cross out a wrong answer · fee doubles",
					version: "v1",
				},
				{
					family: "risk",
					name: "Deprecated",
					slots: 4,
					detail: "All coverage ×2.5 · gone in 3 clears",
				},
				{
					family: "focus",
					name: ".ts",
					slots: 1,
					detail: "TS polls ×1.25",
					version: "v1",
				},
			],
		},
		required: {
			note: "Answer all 5 polls",
			coverage: {
				detail: "earn 60% in this window",
			},
		},
		audits: {
			meta: "1 running",
			rows: [
				{
					code: "402",
					name: "Payment Required",
					cue: "paid actions cost double",
				},
			],
		},
		onClear: {
			reward: "+160 KB",
			swatchLabel: "Lavender",
			swatch: "lavender",
			missPenalty: "remove 2 slots",
		},
		footer: {
			changeLabel: "← change · 102 KB",
			onChange: noop,
			communityLabel: "Community",
			onCommunity: noop,
			startLabel: "Start Lavender →",
			onStart: noop,
		},
	},
};

export const WithPrefetchAndSuppressedAudit: Story = {
	args: {
		...BeforeLavender.args,
		audits: {
			meta: "none running",
			rows: [
				{
					code: "402",
					name: "Payment Required",
					cue: "paid actions cost double",
					suppressed: true,
				},
			],
		},
		prefetch: {
			thisGate: ["TypeScript", "JavaScript"],
			nextGate: ["Git"],
		},
	},
};

export const Mobile: Story = {
	...BeforeLavender,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};

export const BeforeElite: Story = {
	args: {
		header: {
			title: "Gate 12 · Elite",
			subtitle: "3 audits · every earlier audit can return",
			swatch: "elite",
			value: "1.9 MB",
			caption: "balance",
		},
		theme: "elite",
		ready: {
			note: "today's 5 polls are ready",
			startLabel: "Start Elite →",
			onStart: noop,
		},
		build: {
			meta: "24 of 24 slots",
			count: "9",
			slots: 24,
			rows: [
				{
					family: "focus",
					name: ".js",
					slots: 1,
					detail: "JS polls ×1.5",
					version: "v2",
				},
				{
					family: "focus",
					name: ".ts",
					slots: 1,
					detail: "TS polls ×1.25",
					version: "v1",
				},
				{
					family: "focus",
					name: ".py",
					slots: 1,
					detail: "Python polls ×1.25",
					version: "v1",
				},
				{
					family: "defense",
					name: "ESLint",
					slots: 1,
					detail: "Cross out a wrong answer · fee doubles",
					version: "v1",
				},
				{
					family: "defense",
					name: "Telemetry",
					slots: 2,
					detail: "See the community split · fee doubles",
					version: "v1",
				},
				{
					family: "risk",
					name: "Deprecated",
					slots: 4,
					detail: "All coverage ×2.5 · gone in 3 clears",
				},
				{
					family: "economy",
					name: "IndexedDB",
					slots: 2,
					detail: "+8 KB an answer · 288 of 320",
				},
				{
					family: "economy",
					name: "Freemium",
					slots: 8,
					detail: "Half price configs · its own bill doubles every gate",
					version: "v1",
				},
				{
					family: "amplify",
					name: "Overclock",
					slots: 4,
					detail: "First answer ×4, every later one ×0.5",
				},
			],
		},
		required: {
			note: "Answer all 5 polls",
			coverage: {
				detail: "earn 85% in this window",
			},
		},
		audits: {
			meta: "3 running",
			rows: [
				{
					code: "408",
					name: "Request Timeout",
					cue: "first 5 polls on a 20s clock",
				},
				{ code: "410", name: "Gone", cue: "a miss peels 5 configs, not 4" },
				{
					code: "413",
					name: "Payload Too Large",
					cue: "12 slots over · 96 KB a poll",
				},
			],
		},
		bills: {
			meta: "this gate",
			rows: [
				{ name: "Storage plan", figure: "−128 KB" },
				{ name: "Freemium", figure: "−128 KB", note: "doubles next gate" },
			],
			total: {
				name: "Total this gate",
				figure: "−256 KB",
				note: "−32 KB a wrong answer",
			},
		},
		onClear: {
			reward: "+512 KB",
			swatchLabel: "Elite",
			swatch: "elite",
			missPenalty: "remove 3 slots",
		},
		footer: {
			changeLabel: "← change · 1.9 MB",
			onChange: noop,
			communityLabel: "Community",
			onCommunity: noop,
			startLabel: "Start Elite →",
			onStart: noop,
		},
	},
};

export const BeforeEliteMobile: Story = {
	...BeforeElite,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};
