import type { Meta, StoryObj } from "@storybook/react";

import {
	EXTRA_SPOT_TIERS,
	extraRentKb,
	extraSpotsUnlocked,
	scheduledSpots,
} from "~/modules/run/run/domain/rules.model";

import { ExtraSpots, extraSpotLabel } from "./ExtraSpots.ui";
import { gateFloorLabel } from "./format";

const meta: Meta<typeof ExtraSpots> = {
	component: ExtraSpots,
	title: "Modern/ExtraSpots",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="max-w-lg p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof ExtraSpots>;

const Ladder = ({
	gatesCleared = 3,
	held = 0,
	storageKb = 500,
}: {
	gatesCleared?: number;
	held?: number;
	storageKb?: number;
}) => {
	const free = scheduledSpots(gatesCleared);
	const unlocked = extraSpotsUnlocked(gatesCleared);

	return (
		<ExtraSpots
			renting={held}
			perGateKb={extraRentKb(held)}
			steps={[
				{
					id: "extra-0",
					label: extraSpotLabel(0),
					makes: `makes ${free}`,
					terms: "free",
					settled: true,
					held: held === 0,
					pick: { onUse: () => {} },
				},
				...EXTRA_SPOT_TIERS.map((tier) => {
					const locked = tier.spots > unlocked;
					const rentKb = extraRentKb(tier.spots);
					return {
						id: `extra-${tier.spots}`,
						label: extraSpotLabel(tier.spots),
						makes: `makes ${free + tier.spots}`,
						terms: `${rentKb} KB a gate`,
						held: tier.spots === held,
						...(locked
							? { opensAt: `opens at ${gateFloorLabel(tier.fromGate)}` }
							: { pick: { disabled: storageKb < rentKb, onUse: () => {} } }),
					};
				}),
			]}
		/>
	);
};

export const MidRun: Story = { render: () => <Ladder /> };

export const RunStart: Story = { render: () => <Ladder gatesCleared={0} /> };

export const Renting: Story = { render: () => <Ladder held={2} /> };

export const CannotAffordIt: Story = {
	render: () => <Ladder storageKb={0} />,
};

export const EveryStepOpen: Story = {
	render: () => <Ladder gatesCleared={9} held={4} />,
};
