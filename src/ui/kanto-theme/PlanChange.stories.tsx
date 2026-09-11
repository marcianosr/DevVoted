import type { Meta, StoryObj } from "@storybook/react";

import { kantoStorageRungs, planChangeFor } from "~/test/kantoPoll.factory";

import { Modal } from "./Modal.ui";
import { Panel } from "./Panel.ui";
import { PlanChange } from "./PlanChange.ui";
import { Screen } from "./Screen.ui";
import { StoragePlan } from "./StoragePlan.ui";

const HELD_TIER = 3;
const DROP_TIER = 2;
const CLIMB_TIER = 3;

const meta: Meta<typeof PlanChange> = {
	component: PlanChange,
	title: "Kanto/PlanChange",
	args: planChangeFor(HELD_TIER, DROP_TIER, 0),
	render: (args) => (
		<Screen theme="cinnabar" width="narrow">
			<Panel>
				<PlanChange {...args} />
			</Panel>
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof PlanChange>;

export const Downgrade: Story = {};

export const DowngradeThatBurns: Story = {
	args: planChangeFor(HELD_TIER, DROP_TIER, 1536),
};

export const Upgrade: Story = {
	args: planChangeFor(DROP_TIER, CLIMB_TIER, 512),
};

export const OverTheLadder: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="cinnabar" width="narrow">
			<StoragePlan rungs={kantoStorageRungs(HELD_TIER, 2048, 512)} />
			<Modal label="Drop to the 1 MB storage plan">
				<PlanChange {...planChangeFor(HELD_TIER, DROP_TIER, 1536)} />
			</Modal>
		</Screen>
	),
};
