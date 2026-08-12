import type { Meta, StoryObj } from "@storybook/react";

import { STORAGE_CAP_KB } from "~/modules/run/run/domain/rules.model";
import { StorageGauge } from "~/modules/run/run/presentation/StorageGauge.ui";

const meta: Meta<typeof StorageGauge> = {
	component: StorageGauge,
	title: "Run/StorageGauge",
	args: { capKb: STORAGE_CAP_KB },
};
export default meta;

type Story = StoryObj<typeof StorageGauge>;

// A fresh run: everything still free.
export const Empty: Story = { args: { usedKb: 0 } };

// Mid-run, a third committed.
export const PartlyUsed: Story = { args: { usedKb: 184 } };

// At the ceiling — further income is discarded.
export const Full: Story = { args: { usedKb: STORAGE_CAP_KB } };
