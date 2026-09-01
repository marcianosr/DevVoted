import type { Meta, StoryObj } from "@storybook/react";

import { HomeScreen } from "./HomeScreen.ui";

const noop = () => {};

const meta: Meta<typeof HomeScreen> = {
	component: HomeScreen,
	title: "Terminal/Screens/Home",
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
type Story = StoryObj<typeof HomeScreen>;

export const MidRun: Story = {
	args: {
		header: {
			title: "DevVoted",
			subtitle: "daily developer trivia",
			swatch: "pallet",
			value: "512 KB",
			caption: "archive",
		},
		theme: "lavender",
		run: {
			swatch: "lavender",
			title: "Your run is on Lavender",
			detail: "gate 4 of 12 · day 6 · 296 KB stored",
			swatches: [
				{ theme: "pallet", state: "earned" },
				{ theme: "boulder", state: "earned" },
				{ theme: "cascade", state: "earned" },
				{ theme: "volcano", state: "earned" },
				{ theme: "lavender", state: "current" },
				...Array.from({ length: 8 }, () => ({ state: "locked" }) as const),
			],
			note: "today's 5 polls are ready",
			resumeLabel: "Resume →",
			onResume: noop,
		},
		today: {
			title: "Today's poll",
			detail: "one question, shared by everyone · 8 have answered",
			playLabel: "Answer it",
			onPlay: noop,
		},
		community: {
			title: "Community",
			detail: "8 runs live · you hold 2 of 9 standouts",
			mapLabel: "Open board",
			onMap: noop,
		},
		collection: {
			swatches: [
				{ theme: "pallet", state: "earned" },
				{ theme: "boulder", state: "earned" },
				{ theme: "cascade", state: "earned" },
				{ theme: "volcano", state: "earned" },
				...Array.from({ length: 9 }, () => ({ state: "pending" }) as const),
			],
			stats: [
				{ value: "4", label: "swatches" },
				{ value: "1.2 MB", label: "archive" },
				{ value: "11", label: "best gate" },
			],
			dexLabel: "Dex",
			onDex: noop,
		},
	},
};

export const Mobile: Story = {
	...MidRun,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};

export const LateRun: Story = {
	args: {
		header: {
			title: "DevVoted",
			subtitle: "daily developer trivia",
			swatch: "seafoam",
			value: "1.9 MB",
			caption: "archive",
		},
		theme: "seafoam",
		run: {
			swatch: "seafoam",
			title: "Your run is on Seafoam",
			detail: "gate 11 of 12 · day 14 · 1.9 MB stored",
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
				{ theme: "seafoam", state: "current" },
				{ state: "locked" },
				{ state: "locked" },
			],
			note: "2 audits running · Elite after this",
			resumeLabel: "Resume →",
			onResume: noop,
		},
		today: {
			title: "Today's poll",
			detail: "one question, shared by everyone · 31 have answered",
			playLabel: "Answer it",
			onPlay: noop,
		},
		community: {
			title: "Community",
			detail: "31 runs live · you hold 7 of 9 standouts",
			mapLabel: "Open board",
			onMap: noop,
		},
		collection: {
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
				...Array.from({ length: 3 }, () => ({ state: "pending" }) as const),
			],
			stats: [
				{ value: "10", label: "swatches" },
				{ value: "4.6 MB", label: "archive" },
				{ value: "11", label: "best gate" },
			],
			dexLabel: "Dex",
			onDex: noop,
		},
	},
};

export const LateRunMobile: Story = {
	...LateRun,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};
