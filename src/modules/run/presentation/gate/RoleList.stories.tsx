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

// The pipeline's open slots surface as empty rows once `slots` exceeds the filled ones.
export const WithEmptySlots: Story = {
	args: { rows, slots: 5 },
};

// The configure screen's hover preview: the eyed bench config renders as a
// would-be row in the next open slot (hollow dot, celadon "click to add"),
// and the open-slot count shrinks by the one it would take.
export const WithSlotPreview: Story = {
	args: {
		rows,
		slots: 5,
		preview: { config: CONFIGS.eslint, onAdd: () => {} },
	},
};

// The shop load-out: chips open a sell/upgrade popover, fresh drafts carry a "new"
// badge, and the expand control rides along as the final row.
export const ShopLoadout: Story = {
	args: {
		rows,
		slots: 4,
		newConfigIds: [CONFIGS.js.id],
		actionsFor: () => [
			{ label: "Upgrade (5% cov)", onClick: () => {} },
			{ label: "Sell +20KB", onClick: () => {} },
		],
		trailing: (
			<button
				type="button"
				className="rounded-lg border-2 border-dashed border-cerulean px-4 py-2 text-sm font-semibold text-cerulean"
			>
				＋ Add slot: 4 → 5
			</button>
		),
	},
};
