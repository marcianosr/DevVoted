import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	SHOP_CAPACITY_SLOTS,
	kantoShopBuild,
	kantoTrackFills,
	maxSlots,
	slotDealsAt,
	usedSlotsOf,
} from "~/test/kantoPoll.factory";

import { Build } from "./Build.ui";
import { KANTO_COLORS } from "./colors";
import { Screen } from "./Screen.ui";
import { SlotTrack, type SlotTrackFill } from "./SlotTrack.ui";

const COLUMN = "flex w-full flex-col gap-3";

const USED = usedSlotsOf(kantoShopBuild);

const WITH_A_MINIFIED: readonly SlotTrackFill[] = [
	...kantoTrackFills,
	{ name: "Dependabot", slots: 0 },
];

const HoveredBuild = () => {
	const [highlight, setHighlight] = useState<string | undefined>();

	return (
		<Build
			configs={kantoShopBuild}
			layout="column"
			slots={{ used: USED, capacity: SHOP_CAPACITY_SLOTS }}
			{...slotDealsAt()}
			highlight={highlight}
			onHighlight={setHighlight}
		/>
	);
};

const meta: Meta<typeof SlotTrack> = {
	component: SlotTrack,
	title: "Kanto/SlotTrack",
	args: {
		fills: kantoTrackFills,
		capacity: SHOP_CAPACITY_SLOTS,
		offered: true,
	},
	render: (args) => (
		<Screen theme="vermillion" width="narrow">
			<SlotTrack {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof SlotTrack>;

export const Roomy: Story = {};

export const Hovered: Story = {
	args: { highlight: ".ts" },
};

export const HoveredOnAWideConfig: Story = {
	args: { highlight: "Telemetry" },
};

export const Full: Story = {
	args: { capacity: USED },
};

export const SoldOut: Story = {
	args: { capacity: maxSlots, offered: false },
};

export const OverCapacity: Story = {
	args: { capacity: 4, offered: false },
};

export const WithAMinifiedConfig: Story = {
	args: { fills: WITH_A_MINIFIED, highlight: "Dependabot" },
};

export const UnderTheBuildItDraws: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<HoveredBuild />
		</Screen>
	),
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:9rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme} width="narrow">
					<div className={COLUMN}>
						<SlotTrack
							fills={kantoTrackFills}
							capacity={SHOP_CAPACITY_SLOTS}
							offered
							highlight="Telemetry"
						/>
					</div>
				</Screen>
			))}
		</div>
	),
};
