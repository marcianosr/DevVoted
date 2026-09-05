import type { Meta, StoryObj } from "@storybook/react";

import { GameOverScreen } from "./GameOverScreen.ui";

const noop = () => {};

const meta: Meta<typeof GameOverScreen> = {
	component: GameOverScreen,
	title: "Terminal/Screens/GameOver",
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
type Story = StoryObj<typeof GameOverScreen>;

export const FellAtLavender: Story = {
	args: {
		earned: {
			swatches: [
				{ theme: "pallet", state: "earned" },
				{ theme: "boulder", state: "earned" },
				{ theme: "cascade", state: "earned" },
				{ theme: "volcano", state: "earned" },
				{ state: "pending" },
			],
			title: "4 swatches earned",
			subtitle: "the only thing you keep",
		},
		fell: {
			swatches: [
				{ theme: "pallet", state: "earned" },
				{ theme: "boulder", state: "earned" },
				{ theme: "cascade", state: "earned" },
				{ theme: "volcano", state: "earned" },
				{ theme: "lavender", state: "pending" },
				...Array.from({ length: 8 }, () => ({ state: "locked" }) as const),
			],
			note: "fell at gate 4 · Lavender",
		},
		archive: {
			kept: { label: "48 KB kept", percent: 22 },
			lost: { label: "174 KB lost" },
			note: "4 of 13 gates · you keep 22%",
		},
		lostBy: {
			meta: "by category",
			rows: [
				{ name: "css", detail: "4 missed of 5", tag: "weakest" },
				{ name: "python", detail: "2 missed of 3" },
				{ name: "javascript", detail: "1 missed of 7", tag: "strongest" },
			],
		},
		finalBuild: {
			meta: "2 of 6 slots",
			rows: [
				{ name: ".js", slots: 1, version: 1, detail: "Survived every removal" },
				{
					name: "ESLint",
					slots: 1,
					version: 1,
					detail: "Used 4 times · cost 120 KB",
				},
			],
			note: "removals at gate 3 and gate 4 took the rest",
		},
		shareLabel: "Share",
		onShare: noop,
		newRunLabel: "New run →",
		onNewRun: noop,
	},
};

export const Mobile: Story = {
	...FellAtLavender,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};

export const FellAtElite: Story = {
	args: {
		earned: {
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
				{ state: "pending" },
			],
			title: "11 swatches earned",
			subtitle: "the only thing you keep",
		},
		fell: {
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
				{ theme: "elite", state: "pending" },
				{ state: "locked" },
			],
			note: "fell at gate 12 · Elite",
		},
		archive: {
			kept: { label: "760 KB kept", percent: 40 },
			lost: { label: "1.14 MB lost" },
			note: "11 of 13 gates · you keep 40%",
		},
		lostBy: {
			meta: "by category",
			rows: [
				{ name: "java", detail: "5 missed of 7", tag: "weakest" },
				{ name: "css", detail: "4 missed of 11" },
				{ name: "python", detail: "3 missed of 6" },
				{ name: "typescript", detail: "2 missed of 12" },
				{ name: "javascript", detail: "1 missed of 14", tag: "strongest" },
			],
		},
		finalBuild: {
			meta: "10 of 12 slots",
			rows: [
				{ name: ".js", slots: 1, version: 1, detail: "Survived every removal" },
				{ name: ".ts", slots: 1, version: 1, detail: "Deployed at gate 2" },
				{
					name: "ESLint",
					slots: 1,
					version: 1,
					detail: "Used 9 times · cost 464 KB",
				},
				{
					name: "Telemetry",
					slots: 2,
					version: 1,
					detail: "Used 4 times · cost 192 KB",
				},
				{
					name: "Deprecated",
					slots: 4,
					version: 1,
					detail: "Faded out twice · rebought at Earth",
				},
				{
					name: "IndexedDB",
					slots: 2,
					version: 1,
					detail: "Banked 1.2 MB across the run",
				},
			],
			note: "removals at gate 11 and gate 12 took the rest",
		},
		shareLabel: "Share",
		onShare: noop,
		newRunLabel: "New run →",
		onNewRun: noop,
	},
};

export const FellAtEliteMobile: Story = {
	...FellAtElite,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};
