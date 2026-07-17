import type { Meta, StoryObj } from "@storybook/react";

import { describeConfig } from "~/modules/run/configs/config.model";
import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import type { RoleRow } from "~/modules/run/gate/configRole.model";
import { RoleList } from "./RoleList.ui";

const meta: Meta<typeof RoleList> = {
	component: RoleList,
	title: "Run/RoleList",
};
export default meta;

type Story = StoryObj<typeof RoleList>;

const rows: readonly RoleRow[] = [
	{
		config: CONFIGS.unitTests,
		role: "requirement",
		description: describeConfig(CONFIGS.unitTests),
		status: "2/3",
		state: "running",
	},
	{
		config: CONFIGS.js,
		role: "conditional",
		description: describeConfig(CONFIGS.js),
		status: "not triggered yet",
		state: "skipped",
	},
	{
		config: CONFIGS.copilot,
		role: "perk",
		description: describeConfig(CONFIGS.copilot),
	},
];

export const AllRoles: Story = {
	args: { rows },
};

// Fixed configs (Unit Tests) keep their spot — only the others get a remove button.
export const Removable: Story = {
	args: { rows, onRemove: () => {} },
};

export const FailedRequirement: Story = {
	args: {
		rows: [
			{
				config: CONFIGS.coldStart,
				role: "requirement",
				description: describeConfig(CONFIGS.coldStart),
				status: "0/2",
				state: "failed",
			},
		],
	},
};
