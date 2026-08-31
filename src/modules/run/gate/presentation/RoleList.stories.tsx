import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { RoleRow } from "~/modules/run/gate/domain/configRole.model";
import { RoleList } from "~/modules/run/gate/presentation/RoleList.ui";

const meta: Meta<typeof RoleList> = {
	component: RoleList,
	title: "Run/RoleList",
};
export default meta;

type Story = StoryObj<typeof RoleList>;

const rows: readonly RoleRow[] = [
	{
		config: CONFIGS.unitTests,
		role: "passive",
		reason: { kind: "config" as const },
	},
	{
		config: CONFIGS.js,
		role: "conditional",
		reason: { kind: "config" as const },
	},
	{
		config: CONFIGS.agentsMd,
		role: "passive",
		reason: { kind: "config" as const },
	},
];

export const AllRoles: Story = {
	args: { rows },
};

export const Removable: Story = {
	args: { rows, onRemove: () => {} },
};

export const JustUpgraded: Story = {
	args: {
		rows: [
			{
				config: { ...CONFIGS.js, level: 2 },
				role: "conditional",
				reason: { kind: "config" as const },
			},
			{
				config: CONFIGS.unitTests,
				role: "passive",
				reason: { kind: "config" as const },
			},
		],
		upgradedConfigId: CONFIGS.js.id,
	},
};

export const ConditionalOnly: Story = {
	args: {
		rows: [
			{
				config: CONFIGS.coldStart,
				role: "conditional",
				reason: { kind: "config" as const },
			},
		],
	},
};

export const WithEmptySlots: Story = {
	args: { rows, freeSlots: 2 },
};

export const WithSlotPreview: Story = {
	args: {
		rows,
		freeSlots: 2,
		preview: { config: CONFIGS.eslint, onAdd: () => {} },
	},
};

export const WithLegendarySlotPreview: Story = {
	args: {
		rows: rows.slice(0, 2),
		freeSlots: 2,
		preview: { config: CONFIGS.agentsMd, onAdd: () => {} },
	},
};

export const ShopLoadout: Story = {
	args: {
		rows,
		freeSlots: 1,
		newConfigIds: [CONFIGS.js.id],
		actionsFor: () => [
			{ label: "Upgrade (5% cov)", onClick: () => {} },
			{ label: "Sell +20KB", onClick: () => {} },
		],
	},
};

export const OfflineConfig: Story = {
	args: { rows, offlineConfigIds: [CONFIGS.agentsMd.id] },
};
