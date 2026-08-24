import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	storagePlanFor,
	storagePlanLadder,
} from "~/modules/run/run/domain/rules.model";

import { capLabel, planOpensAt } from "./format";
import { Plan, type PlanProps } from "./Plan.ui";

const meta: Meta<typeof Plan> = {
	component: Plan,
	title: "Modern/Plan",
	// Storybook reads every named export as a story; this one is a helper the
	// shop story imports, not something to render.
	excludeStories: ["planLadderAt"],
	decorators: [
		(Story) => (
			<div data-gate-theme="rainbow" className="max-w-md p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Plan>;

/**
 * The rungs a run can see: `storagePlanLadder` returns every unlocked plan plus
 * the next one, which is what puts a single `???` at the bottom of the list.
 * The right-hand figure is headroom on the plan in force and the cap you would
 * gain on any other.
 */
export const planLadderAt = (
	gatesCleared: number,
	tier: number,
	usedKb: number,
	onSelect: (id: string) => void
): readonly PlanProps[] => {
	const held = storagePlanFor(tier);

	return storagePlanLadder(gatesCleared).map((plan) =>
		plan.fromGate > gatesCleared
			? {
					id: `tier-${plan.tier}`,
					locked: true,
					opensAt: planOpensAt(plan.fromGate),
				}
			: {
					id: `tier-${plan.tier}`,
					name: "storage-plan",
					cap: capLabel(plan.capKb),
					terms: plan.billKb === 0 ? "free" : `${plan.billKb} KB / gate`,
					free: plan.billKb === 0,
					figure:
						plan.tier === tier
							? `${plan.capKb - usedKb} free now`
							: `+${plan.capKb - held.capKb}`,
					selected: plan.tier === tier,
					onSelect,
				}
	);
};

const Ladder = ({ start = 1 }: { start?: number }) => {
	const [tier, setTier] = useState(start);
	const plans = planLadderAt(4, tier, 216, (id) =>
		setTier(Number(id.replace("tier-", "")))
	);

	return (
		<div className="flex flex-col gap-1.5">
			{plans.map((plan) => (
				<Plan key={plan.id} {...plan} />
			))}
		</div>
	);
};

/** Gate 4 cleared, still on the free tier: four rungs open, one sealed. */
export const Ladder4: Story = { render: () => <Ladder /> };

export const OnAPaidPlan: Story = { render: () => <Ladder start={3} /> };

export const Sealed: Story = {
	args: { id: "tier-5", locked: true, opensAt: "opens when gate 6 clears" },
};
