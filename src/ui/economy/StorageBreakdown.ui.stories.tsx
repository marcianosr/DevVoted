import type { Meta, StoryObj } from "@storybook/react";
import { StorageBreakdown } from "./StorageBreakdown.ui";

const meta: Meta<typeof StorageBreakdown> = {
	component: StorageBreakdown,
	title: "Economy/Molecules/Storage Breakdown",
	decorators: [
		(Story) => (
			<div className="max-w-xs">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof StorageBreakdown>;

const MB = 1024 * 1024;
const KB = 1024;

export const Typical: Story = {
	args: {
		storageLimit: 2 * MB,
		storageUsed: 896 * KB,
		storageAvailable: MB + 128 * KB,
		configsStorage: 768 * KB,
		rerollsStorage: 128 * KB,
		deinstallPenalty: 0,
		injectedArchive: 0,
		recentGain: null,
	},
};

export const WithRecentGain: Story = {
	args: {
		storageLimit: 2 * MB,
		storageUsed: 512 * KB,
		storageAvailable: 1536 * KB,
		configsStorage: 512 * KB,
		rerollsStorage: 0,
		deinstallPenalty: 0,
		injectedArchive: 0,
		recentGain: 512 * KB,
	},
};

export const WithInjectedArchive: Story = {
	args: {
		storageLimit: 2.5 * MB,
		storageUsed: 640 * KB,
		storageAvailable: 1920 * KB,
		configsStorage: 512 * KB,
		rerollsStorage: 128 * KB,
		deinstallPenalty: 0,
		injectedArchive: 512 * KB,
		recentGain: null,
	},
};

export const NearlyFull: Story = {
	args: {
		storageLimit: MB,
		storageUsed: 960 * KB,
		storageAvailable: 64 * KB,
		configsStorage: 768 * KB,
		rerollsStorage: 128 * KB,
		deinstallPenalty: 64 * KB,
		injectedArchive: 0,
		recentGain: null,
	},
};

export const Empty: Story = {
	args: {
		storageLimit: MB,
		storageUsed: 0,
		storageAvailable: MB,
		configsStorage: 0,
		rerollsStorage: 0,
		deinstallPenalty: 0,
		injectedArchive: 0,
		recentGain: null,
	},
};
