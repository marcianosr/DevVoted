import type { Meta, StoryObj } from "@storybook/react";

import {
	revealsPlanTier,
	STORAGE_PLANS,
} from "~/modules/run/run/domain/rules.model";
import { kbLabel } from "~/shared/lib/storage";

import { StoragePlan, type StoragePlanProps } from "./StoragePlan.ui";

const noop = () => {};

const planOn = (
	held: number,
	heldKb: number,
	opts: { locked?: boolean; broke?: boolean; peakKb?: number } = {}
): StoragePlanProps => {
	// A run that has filled the plan it rents, unless a story says otherwise:
	// that is the account this section is usually opened by.
	const peakKb = opts.peakKb ?? STORAGE_PLANS[held].capKb;

	return {
		meter: {
			heldKb,
			capKb: STORAGE_PLANS[held].capKb,
			nextCapKb: STORAGE_PLANS[held + 1]?.capKb,
		},
		cards: STORAGE_PLANS.map((plan) => {
			const revealed = revealsPlanTier(plan.tier, peakKb);
			const affordable = plan.tier <= held || !opts.broke;
			const selectable =
				revealed && plan.tier !== held && !opts.locked && affordable;

			return {
				capKb: plan.capKb,
				rentKb: plan.perGateKb,
				held: plan.tier === held,
				revealed,
				requirement: revealed
					? undefined
					: `opens at ${kbLabel(STORAGE_PLANS[plan.tier - 1].capKb)} held · best ${kbLabel(peakKb)}`,
				burnsKb: Math.max(0, heldKb - plan.capKb),
				refusal:
					revealed && plan.tier !== held && !affordable
						? `bills ${kbLabel(plan.perGateKb)} a gate, you hold ${kbLabel(heldKb)}`
						: undefined,
				onSelect: selectable ? noop : undefined,
			};
		}),
	};
};

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

/** The rung above is masked until a run fills the cap below it, and the mask
 * says so rather than repeating itself. */
export const NextRungNotYetEarned: Story = {
	args: planOn(1, 300, { peakKb: 300 }),
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
