import type { Meta, StoryObj } from "@storybook/react";

import { Panel } from "../Panel.ui";
import type { StorageRung } from "../StoragePlan.ui";
import { StoragePanel } from "./StoragePanel.ui";

export const dexStorageRungs: readonly StorageRung[] = [
	{ capKb: 256, rentKb: 0 },
	{ capKb: 512, rentKb: 32 },
	{ capKb: 1024, rentKb: 96 },
	{ capKb: 2048, rentKb: 224 },
	{ capKb: 3072, rentKb: 448 },
	{ capKb: 5120, rentKb: 768 },
	{ capKb: 10240, rentKb: 1280 },
];

const meta: Meta<typeof StoragePanel> = {
	component: StoragePanel,
	title: "Terminal/Screens/Dex/Storage",
	// Storybook reads every named export as a story, so the data other story
	// files import has to be named here or it renders as a story with no args.
	excludeStories: ["dexStorageRungs"],
	parameters: { layout: "fullscreen" },
	decorators: [
		(Story) => (
			<div className="min-h-screen bg-zinc-900 p-6">
				<Panel>
					<Story />
				</Panel>
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof StoragePanel>;

export const TheLadder: Story = { args: { rungs: dexStorageRungs } };

export const StillLocked: Story = {
	args: { rungs: dexStorageRungs, locked: true },
};
