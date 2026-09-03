import type { Meta, StoryObj } from "@storybook/react";

import { STORAGE_PLANS } from "~/modules/run/run/domain/rules.model";

import { StoragePlan, type StoragePlanProps } from "./StoragePlan.ui";

const noop = () => {};

const TOP_TIER = STORAGE_PLANS.length - 1;
const TOP_CAP_KB = STORAGE_PLANS[TOP_TIER].capKb;

const rungAt = (tier: number) => ({
	capKb: STORAGE_PLANS[tier].capKb,
	rentKb: STORAGE_PLANS[tier].perGateKb,
});

const onRung = (tier: number, heldKb: number): StoragePlanProps => ({
	heldKb,
	current: rungAt(tier),
	next: tier === TOP_TIER ? undefined : rungAt(tier + 1),
	drop: tier === 0 ? undefined : { toKb: rungAt(tier - 1).capKb, onDrop: noop },
	moreRungs: Math.max(0, TOP_TIER - tier - 1),
	topCapKb: TOP_CAP_KB,
	onUpgrade: tier === TOP_TIER ? undefined : noop,
});

const meta: Meta<typeof StoragePlan> = {
	component: StoragePlan,
	title: "Terminal/StoragePlan",
	decorators: [
		(Story) => (
			<div className="max-w-3xl bg-zinc-900 p-6">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof StoragePlan>;

export const OnTheOneMbRung: Story = {
	args: onRung(2, 668),
};

export const FreeRung: Story = {
	args: onRung(0, 142),
};

export const DropWouldBurn: Story = {
	args: {
		...onRung(2, 812),
		drop: { toKb: rungAt(1).capKb, victim: "Telemetry", onDrop: noop },
	},
};

export const AtTheCeiling: Story = {
	args: onRung(TOP_TIER, 4096),
};
