import type { Meta, StoryObj } from "@storybook/react";

import { NewRunScreen } from "./NewRunScreen.ui";

const noop = () => {};

const meta: Meta<typeof NewRunScreen> = {
	component: NewRunScreen,
	title: "Terminal/Screens/NewRun",
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
type Story = StoryObj<typeof NewRunScreen>;

export const FreshDeal: Story = {
	args: {
		header: {
			title: "New run",
			subtitle: "Pallet gate · 3% coverage · miss removes 1 slot",
			swatch: "pallet",
			value: "512 KB",
			caption: "archive",
		},
		theme: "pallet",
		storage: { meta: "3 of 4 slots", slots: 4 },
		build: {
			meta: "3",
			buySlot: {
				label: "Buy slot 5",
				detail: "The fifth is the last one this plan allows",
				price: "16 KB",
				onBuy: noop,
			},
			rows: [
				{
					family: "focus",
					name: ".js",
					detail: "JS polls ×1.25",
					version: "v1",
					slots: 1,
				},
				{
					family: "focus",
					name: ".ts",
					detail: "TS polls ×1.25",
					version: "v1",
					slots: 1,
				},
				{
					family: "defense",
					name: "ESLint",
					detail: "Cross out a wrong answer · fee doubles",
					version: "v1",
					slots: 1,
				},
			],
		},
		dealt: {
			meta: "8 from 30",
			rows: [
				{
					family: "focus",
					name: ".jsx",
					slots: 1,
					detail: "React polls ×1.25",
					deployLabel: "Deploy",
					onDeploy: noop,
				},
				{
					family: "risk",
					name: "Cold Start",
					slots: 2,
					detail: "The gate's first answer ×2",
					locked: true,
				},
				{
					family: "economy",
					name: "Moore's Law",
					slots: 1,
					detail: "+2% of held storage a clear",
					deployLabel: "Deploy",
					onDeploy: noop,
				},
				{
					family: "amplify",
					name: "Overclock",
					slots: 4,
					detail: "First answer ×4, every later one ×0.5",
					locked: true,
				},
			],
		},
		startLabel: "Start the run · 1 spare →",
		onStart: noop,
	},
};

export const Mobile: Story = {
	...FreshDeal,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};

const starterStacks = {
	meta: "3",
	rows: [
		{
			id: "ship-it",
			name: "Gamble",
			blurb: "Fast but risky.",
			takeLabel: "Take this stack",
			onTake: noop,
		},
		{
			id: "test-everything",
			name: "Safe start",
			blurb: "Safer JS/TS focus.",
			recommended: true,
			takeLabel: "Take this stack",
			onTake: noop,
		},
		{
			id: "full-stack",
			name: "Category spread",
			blurb: "Balanced across categories.",
			takeLabel: "Take this stack",
			onTake: noop,
		},
	],
} as const;

export const WithStarterStacks: Story = {
	args: { ...FreshDeal.args, combos: starterStacks },
};

export const WithStarterStacksMobile: Story = {
	...WithStarterStacks,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};

export const TaggedAtSeafoam: Story = {
	args: {
		header: {
			title: "New run",
			subtitle: "Seafoam gate · git tag checkout · miss removes 2 slots",
			swatch: "seafoam",
			value: "1.9 MB",
			caption: "archive",
		},
		theme: "seafoam",
		storage: { meta: "15 of 16 slots", slots: 16 },
		gitTag: {
			title: "Restored from your git tag",
			detail:
				"You start at gate 8 with the build you saved, instead of gate 0 with four slots. The tag is spent — save another in a shop to keep this run.",
		},
		build: {
			meta: "7",
			buySlot: {
				label: "Buy slot 17",
				detail: "Every slot after this one costs double",
				price: "256 KB",
				onBuy: noop,
			},
			rows: [
				{
					family: "focus",
					name: ".js",
					detail: "JS polls ×1.5",
					remove: { label: "Uninstall", onRemove: noop },
					version: "v2",
					slots: 1,
				},
				{
					family: "focus",
					name: ".ts",
					detail: "TS polls ×1.25",
					remove: { label: "Uninstall", onRemove: noop },
					version: "v1",
					slots: 1,
				},
				{
					family: "defense",
					name: "ESLint",
					detail: "Cross out a wrong answer · fee doubles",
					remove: { label: "Uninstall", onRemove: noop },
					version: "v1",
					slots: 1,
				},
				{
					family: "defense",
					name: "Telemetry",
					detail: "See the community split · fee doubles",
					remove: { label: "Uninstall", onRemove: noop },
					version: "v1",
					slots: 2,
				},
				{
					family: "risk",
					name: "Deprecated",
					detail: "All coverage ×2.5 · gone in 3 clears",
					remove: { label: "Uninstall", onRemove: noop },
					slots: 4,
				},
				{
					family: "economy",
					name: "IndexedDB",
					detail: "+8 KB an answer · fresh at 0 of 320",
					remove: { label: "Uninstall", onRemove: noop },
					slots: 2,
				},
				{
					family: "amplify",
					name: "Overclock",
					detail: "First answer ×4, every later one ×0.5",
					remove: { label: "Uninstall", onRemove: noop },
					slots: 4,
				},
			],
		},
		dealt: {
			meta: "12 from 30",
			rows: [
				{
					family: "focus",
					name: ".jsx",
					slots: 1,
					detail: "React polls ×1.25",
					deployLabel: "Deploy",
					onDeploy: noop,
				},
				{
					family: "focus",
					name: ".py",
					slots: 1,
					detail: "Python polls ×1.25",
					deployLabel: "Deploy",
					onDeploy: noop,
				},
				{
					family: "risk",
					name: "Cold Start",
					slots: 2,
					detail: "The gate's first answer ×2",
					locked: true,
				},
				{
					family: "economy",
					name: "Moore's Law",
					slots: 1,
					detail: "+2% of held storage a clear",
					deployLabel: "Deploy",
					onDeploy: noop,
				},
				{
					family: "economy",
					name: "Unit Tests",
					slots: 1,
					detail: "+32 KB on gate clear",
					deployLabel: "Deploy",
					onDeploy: noop,
				},
				{
					family: "economy",
					name: "Freemium",
					slots: 8,
					detail: "Half price configs · bills 8 KB, doubling",
					locked: true,
				},
			],
		},
		startLabel: "Start the run · 3 spare →",
		onStart: noop,
	},
};

export const TaggedAtSeafoamMobile: Story = {
	...TaggedAtSeafoam,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};
