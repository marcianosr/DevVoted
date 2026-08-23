import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { storagePlanFor } from "~/modules/run/run/domain/rules.model";

import { planLadderAt } from "./Plan.stories";
import { StoragePlan } from "./StoragePlan.ui";

const meta: Meta<typeof StoragePlan> = {
	component: StoragePlan,
	title: "Modern/StoragePlan",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="max-w-md p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof StoragePlan>;

const USED_KB = 216;

const Subscribing = ({
	gatesCleared = 4,
	start = 1,
}: {
	gatesCleared?: number;
	start?: number;
}) => {
	const [tier, setTier] = useState(start);

	return (
		<StoragePlan
			plans={planLadderAt(gatesCleared, tier, USED_KB, (id) =>
				setTier(Number(id.replace("tier-", "")))
			)}
			nextBillKb={storagePlanFor(tier).billKb}
		/>
	);
};

/** Gate 4 cleared, still on the free tier: four rungs open, one sealed. */
export const FreeTier: Story = { render: () => <Subscribing /> };

/** On 768 KB, so the coming gate bills 16 and the figures read as upgrades. */
export const Subscribed: Story = { render: () => <Subscribing start={3} /> };

/** A fresh run sees only the two gate-0 rungs and the next one along. */
export const RunStart: Story = {
	render: () => <Subscribing gatesCleared={0} />,
};

/** Top of the ladder: every rung open, nothing left to reveal. */
export const FullLadder: Story = {
	render: () => <Subscribing gatesCleared={10} start={7} />,
};
