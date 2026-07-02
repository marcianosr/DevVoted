import type { Meta, StoryObj } from "@storybook/react";

import { STORAGE_UNITS } from "~/lib/storage";
import { StorageMeter } from "./StorageMeter.ui";

const meta: Meta<typeof StorageMeter> = {
	component: StorageMeter,
	title: "Runs/StorageMeter",
};
export default meta;

type Story = StoryObj<typeof StorageMeter>;

export const HalfFull: Story = {
	args: { used: STORAGE_UNITS.MB / 2, limit: STORAGE_UNITS.MB },
};

export const WithReward: Story = {
	args: {
		used: STORAGE_UNITS.MB / 2,
		limit: STORAGE_UNITS.MB,
		delta: STORAGE_UNITS.KB * 128,
	},
};

export const NearlyFull: Story = {
	args: { used: (STORAGE_UNITS.MB * 9) / 10, limit: STORAGE_UNITS.MB },
};
