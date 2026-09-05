import type { Meta, StoryObj } from "@storybook/react";

import { STORAGE_PLANS } from "~/modules/run/run/domain/rules.model";

import { Panel } from "../Panel.ui";
import type { StorageRung } from "../StoragePlan.ui";
import { StoragePanel } from "./StoragePanel.ui";

export const dexStorageRungs: readonly StorageRung[] = STORAGE_PLANS.map(
	(plan) => ({ capKb: plan.capKb, rentKb: plan.perGateKb })
);

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
