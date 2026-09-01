import type { Meta, StoryObj } from "@storybook/react";

import { GateClearScreen } from "./GateClearScreen.ui";

const noop = () => {};

const meta: Meta<typeof GateClearScreen> = {
	component: GateClearScreen,
	title: "Terminal/Screens/GateClear",
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
type Story = StoryObj<typeof GateClearScreen>;

export const LavenderCleared: Story = {
	args: {
		theme: "lavender",
		title: "Lavender cleared",
		subtitle: "gate 4 of 12",
		audits: [
			{ code: "424", name: "Failed Dependency", cue: "Telemetry sat it out" },
		],
		nextUp: "next up · Vermilion",
		chips: [
			{ label: "62.4% of 60% needed", tone: "viridian" },
			{ label: "4 of 5 right" },
			{ label: "streak 3" },
		],
		swatches: [
			{ theme: "pallet", state: "earned" },
			{ theme: "boulder", state: "earned" },
			{ theme: "cascade", state: "earned" },
			{ theme: "volcano", state: "earned" },
			{ theme: "lavender", state: "earned" },
			...Array.from({ length: 8 }, () => ({ state: "locked" }) as const),
		],
		rewards: [
			{ name: "gate cleared", figure: "+160 KB" },
			{ name: "4 correct answers", figure: "+32 KB" },
			{ name: "IndexedDB", figure: "+32 KB" },
			{ name: "storage plan · 768 KB", figure: "−16 KB" },
			{ name: "balance", value: "310 KB" },
		],
		coverage: {
			rows: [
				{ category: "JavaScript", polls: "2 polls", gain: "+24.6" },
				{ category: "Git", polls: "1 poll", gain: "+19.2" },
				{ category: "TypeScript", polls: "1 poll", gain: "+18.6" },
			],
			total: "+62.4%",
		},
		changed: {
			meta: "2 configs",
			rows: [
				{
					family: "risk",
					name: "Deprecated",
					slots: 4,
					detail: "×2.5 → ×2.0 · gone in 2 clears",
					badge: { label: "faded", tone: "saffron" },
				},
				{
					family: "economy",
					name: "IndexedDB",
					slots: 2,
					detail: "128 of 320 KB this run",
					meterPercent: 40,
				},
			],
		},
		reviewLabel: "Review answers",
		onReview: noop,
		shopLabel: "To the shop →",
		onShop: noop,
	},
};

export const Mobile: Story = {
	...LavenderCleared,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};

export const SeafoamCleared: Story = {
	args: {
		theme: "seafoam",
		title: "Seafoam cleared",
		subtitle: "gate 11 of 12",
		audits: [
			{ code: "410", name: "Gone", cue: "a miss would have peeled 5" },
			{
				code: "426",
				name: "Upgrade Required",
				cue: "Prefetch sat it out",
			},
			{ code: "403", name: "Forbidden", cue: "no linting, no peeking" },
		],
		nextUp: "next up · Elite",
		chips: [
			{ label: "91.2% of 75% needed", tone: "viridian" },
			{ label: "5 of 5 right" },
			{ label: "streak 12" },
			{ label: "2 audits survived" },
		],
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
			{ state: "locked" },
			{ state: "locked" },
		],
		rewards: [
			{ name: "gate cleared", figure: "+320 KB" },
			{ name: "5 correct answers", figure: "+40 KB" },
			{ name: "IndexedDB", figure: "+40 KB" },
			{ name: "Moore's Law", figure: "+36 KB" },
			{ name: "Unit Tests", figure: "+32 KB" },
			{ name: "storage plan · 2.5 MB", figure: "−128 KB" },
			{ name: "balance", value: "2.1 MB" },
		],
		coverage: {
			rows: [
				{ category: "JavaScript", polls: "2 polls", gain: "+33.5" },
				{ category: "TypeScript", polls: "1 poll", gain: "+22.4" },
				{ category: "CSS", polls: "1 poll", gain: "+19.1" },
				{ category: "Java", polls: "1 poll", gain: "+16.2" },
			],
			total: "+91.2%",
		},
		changed: {
			meta: "4 configs",
			rows: [
				{
					family: "risk",
					name: "Deprecated",
					slots: 4,
					detail: "×2.0 → ×1.5 · gone next clear",
					badge: { label: "faded", tone: "saffron" },
				},
				{
					family: "economy",
					name: "IndexedDB",
					slots: 2,
					detail: "312 of 320 KB this run",
					meterPercent: 98,
				},
				{
					family: "amplify",
					name: "Overclock",
					slots: 4,
					detail: "Resets · first answer ×4 again",
					badge: { label: "reset", tone: "celadon" },
				},
				{
					family: "economy",
					name: "Moore's Law",
					slots: 1,
					detail: "+2% of 1.8 MB held",
					badge: { label: "+36 KB", tone: "viridian" },
				},
			],
		},
		reviewLabel: "Review answers",
		onReview: noop,
		shopLabel: "To the shop →",
		onShop: noop,
	},
};

export const SeafoamClearedMobile: Story = {
	...SeafoamCleared,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};
