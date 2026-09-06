import type { Meta, StoryObj } from "@storybook/react";

import { PrepScreen } from "./PrepScreen.ui";

const noop = () => {};

const LAVENDER_WINDOW = {
	title: "Lavender gate",
	swatch: "lavender" as const,
	target: {
		reading: "18.4 of 60%",
		held: 18.4,
		demand: 60,
	},
	polls: "0 / 5 answered",
	pollCount: 5,
	audits: [{ label: "402 Payment Required" }],
};

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
		},
		build: {
			slots: 8,
			slotsUsed: 7,
			rows: [
				{
					name: ".js",
					slots: 1,
					detail: "JS polls ×1.25",
					version: 1,
					maxVersion: 5,
				},
				{
					name: "ESLint",
					slots: 1,
					detail: "Cross out a wrong answer · fee doubles",
					version: 1,
					maxVersion: 5,
				},
				{
					name: "Deprecated",
					slots: 4,
					detail: "All coverage ×2.5 · gone in 3 clears",
					version: 1,
					maxVersion: 5,
				},
				{
					name: ".ts",
					slots: 1,
					detail: "TS polls ×1.25",
					version: 1,
					maxVersion: 5,
				},
			],
		},
		window: LAVENDER_WINDOW,
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
		window: {
			...LAVENDER_WINDOW,
			audits: [{ label: "402 Payment Required", suppressed: true }],
			source: "Prefetch",
			optionCounts: [4, 4, 5, 6, 4],
			categories: [
				{ label: "typescript", count: 3 },
				{ label: "javascript", count: 2 },
			],
			nextCategories: [{ label: "git", count: 5 }],
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
		},
		build: {
			slots: 24,
			slotsUsed: 24,
			rows: [
				{
					name: ".js",
					slots: 1,
					detail: "JS polls ×1.5",
					version: 2,
					maxVersion: 5,
				},
				{
					name: ".ts",
					slots: 1,
					detail: "TS polls ×1.25",
					version: 1,
					maxVersion: 5,
				},
				{
					name: ".py",
					slots: 1,
					detail: "Python polls ×1.25",
					version: 1,
					maxVersion: 5,
				},
				{
					name: "ESLint",
					slots: 1,
					detail: "Cross out a wrong answer · fee doubles",
					version: 1,
					maxVersion: 5,
				},
				{
					name: "Telemetry",
					slots: 2,
					detail: "See the community split · fee doubles",
					version: 1,
					maxVersion: 5,
				},
				{
					name: "Deprecated",
					slots: 4,
					detail: "All coverage ×2.5 · gone in 3 clears",
					version: 1,
					maxVersion: 5,
				},
				{
					name: "IndexedDB",
					slots: 2,
					detail: "+8 KB an answer · 288 of 320",
					version: 1,
					maxVersion: 5,
				},
				{
					name: "Freemium",
					slots: 8,
					detail: "Half price configs · its own bill doubles every gate",
					version: 1,
					maxVersion: 5,
				},
				{
					name: "Overclock",
					slots: 4,
					detail: "First answer ×4, every later one ×0.5",
					version: 1,
					maxVersion: 5,
				},
			],
		},
		window: {
			title: "Elite gate",
			swatch: "elite" as const,
			target: {
				reading: "92.5 of 85%",
				held: 92.5,
				demand: 85,
			},
			polls: "2 / 5 answered",
			pollCount: 5,
			source: "Prefetch",
			pollTypes: [
				{ label: "single", count: 1 },
				{ label: "multiple", count: 4 },
			],
			optionCounts: [4, 5, 6, 5, 6],
			audits: [
				{ label: "408 Request Timeout" },
				{ label: "410 Gone" },
				{ label: "413 Payload Too Large" },
			],
			categories: [
				{ label: "javascript", count: 2 },
				{ label: "css", count: 2 },
				{ label: "java", count: 1 },
			],
			nextCategories: [
				{ label: "python", count: 3 },
				{ label: "vue", count: 2 },
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

export const Rebasing: Story = {
	...BeforeElite,
	args: {
		...BeforeElite.args,
		rebase: {
			label: "git rebase -i",
			note: "locks when you answer",
			slots: [
				{ id: "p1", category: "Java", coverage: "8%" },
				{ id: "p2", category: "React", coverage: "74%" },
				{ id: "p3", category: "CSS", coverage: "41%" },
				{ id: "p4", category: "React", coverage: "74%" },
				{ id: "p5", category: "Python", coverage: "12%" },
			],
			onMove: noop,
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
