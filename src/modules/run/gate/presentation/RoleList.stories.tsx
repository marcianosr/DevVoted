import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { RoleRow } from "~/modules/run/gate/domain/configRole.model";
import { RoleList } from "~/modules/run/gate/presentation/RoleList.ui";
import { nextSlotRow } from "~/modules/run/pipeline/presentation/SlotUnlockRow.ui";

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
		reason: { kind: "config" as const },
		status: "2/3",
		state: "running",
	},
	{
		config: CONFIGS.js,
		role: "conditional",
		reason: { kind: "config" as const },
		state: "skipped",
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
				reason: { kind: "config" as const },
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
// would-be row in the next open slot (hollow dot, dashed rarity border),
// and the open-slot count shrinks by the one it would take.
export const WithSlotPreview: Story = {
	args: {
		rows,
		slots: 5,
		preview: { config: CONFIGS.eslint, onAdd: () => {} },
	},
};

// AGENTS.md is the roster's only legendary, and a masked gradient has no dashed
// form — so its preview box wears the same gradient ring its chip wears.
export const WithLegendarySlotPreview: Story = {
	args: {
		rows: rows.slice(0, 2),
		slots: 5,
		preview: { config: CONFIGS.agentsMd, onAdd: () => {} },
	},
};

// The shop load-out: chips open a sell/upgrade popover, fresh drafts carry a "new"
// badge, and the next slot's swatch rides along as the final row.
export const ShopLoadout: Story = {
	args: {
		rows,
		slots: 4,
		newConfigIds: [CONFIGS.js.id],
		actionsFor: () => [
			{ label: "Upgrade (5% cov)", onClick: () => {} },
			{ label: "Sell +20KB", onClick: () => {} },
		],
		trailing: nextSlotRow({
			slots: 4,
			nextSlotGate: 2,
		}),
	},
};

/**
 * A config an audit has switched off (ADR-038). It keeps its slot and its place
 * in the build — the pipeline is unchanged, the effect just does nothing — so the
 * row dims and strikes its own promise rather than disappearing.
 */
export const OfflineConfig: Story = {
	args: { rows, offlineConfigIds: [CONFIGS.agentsMd.id] },
};
