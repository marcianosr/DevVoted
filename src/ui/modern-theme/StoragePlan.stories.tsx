import type { Meta, StoryObj } from "@storybook/react";

import { STORAGE_PLANS } from "~/modules/run/run/domain/rules.model";

import { capLabel } from "./format";
import { StoragePlan, type StoragePlanRow } from "./StoragePlan.ui";

const ladder = (heldTier: number, balanceKb = 0): readonly StoragePlanRow[] =>
	STORAGE_PLANS.map((plan) => ({
		id: `plan-${plan.tier}`,
		label: capLabel(plan.capKb),
		terms: plan.perGateKb === 0 ? "free" : `${plan.perGateKb} KB a gate`,
		free: plan.perGateKb === 0,
		held: plan.tier === heldTier,
		...(balanceKb > plan.capKb
			? { warns: `burns ${balanceKb - plan.capKb} KB` }
			: {}),
		pick: { onUse: () => {} },
	}));

const meta: Meta<typeof StoragePlan> = {
	component: StoragePlan,
	title: "Modern/StoragePlan",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="max-w-lg p-4">
				<Story />
			</div>
		),
	],
	args: { rows: ladder(0), cap: "512 KB", terms: "free" },
};
export default meta;

type Story = StoryObj<typeof StoragePlan>;

export const OnTheFreeCap: Story = {};

export const OnAPaidPlan: Story = {
	args: { rows: ladder(2), cap: "1 MB", terms: "32 KB a gate" },
};

export const ADowngradeWouldBurn: Story = {
	args: { rows: ladder(4, 1800), cap: "2.5 MB", terms: "128 KB a gate" },
};
