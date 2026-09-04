import type { Meta, StoryObj } from "@storybook/react";

import { STORAGE_PLANS } from "~/modules/run/run/domain/rules.model";
import { kbLabel } from "~/shared/lib/storage";

import { StoragePlan, type StoragePlanProps } from "./StoragePlan.ui";

const noop = () => {};

const planOn = (
	held: number,
	heldKb: number,
	opts: { locked?: boolean; broke?: boolean } = {}
): StoragePlanProps => ({
	meter: {
		heldKb,
		capKb: STORAGE_PLANS[held].capKb,
		nextCapKb: STORAGE_PLANS[held + 1]?.capKb,
	},
	cards: STORAGE_PLANS.map((plan) => {
		const revealed = plan.tier <= held + 1;
		const affordable = plan.tier <= held || !opts.broke;
		const selectable =
			revealed && plan.tier !== held && !opts.locked && affordable;

		return {
			capKb: plan.capKb,
			rentKb: plan.perGateKb,
			held: plan.tier === held,
			revealed,
			burnsKb: Math.max(0, heldKb - plan.capKb),
			refusal:
				revealed && plan.tier !== held && !affordable
					? `bills ${kbLabel(plan.perGateKb)} a gate, you hold ${kbLabel(heldKb)}`
					: undefined,
			onSelect: selectable ? noop : undefined,
		};
	}),
});

const meta: Meta<typeof StoragePlan> = {
	component: StoragePlan,
	title: "Terminal/StoragePlan",
	decorators: [
		(Story) => (
			<div className="max-w-2xl bg-zinc-900 p-6">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof StoragePlan>;

export const FreeTierStart: Story = {
	args: planOn(0, 142),
};

export const MidLadderCentered: Story = {
	args: planOn(3, 1229),
};

export const UnaffordableNextRung: Story = {
	args: planOn(0, 8, { broke: true }),
};

export const DowngradeBurns: Story = {
	args: planOn(2, 812),
};

export const AtTheCeiling: Story = {
	args: planOn(STORAGE_PLANS.length - 1, 4096),
};

export const ShopLocked: Story = {
	args: planOn(3, 1229, { locked: true }),
};
