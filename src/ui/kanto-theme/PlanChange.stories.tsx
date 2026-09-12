import type { Meta, StoryObj } from "@storybook/react";

import { planChangeFor } from "~/test/kantoPoll.factory";

import { Modal } from "./Modal.ui";
import { Panel } from "./Panel.ui";
import { PlanChange } from "./PlanChange.ui";
import { Screen } from "./Screen.ui";

const HELD_TIER = 0;
const NEXT_TIER = 1;
const FAR_TIER = 2;

const meta: Meta<typeof PlanChange> = {
	component: PlanChange,
	title: "Kanto/PlanChange",
	args: planChangeFor(HELD_TIER, NEXT_TIER, 512),
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

export const NextRung: Story = {};

export const TwoRungsUp: Story = {
	args: planChangeFor(HELD_TIER, FAR_TIER, 1024),
};

export const BarelyAffordable: Story = {
	args: planChangeFor(HELD_TIER, NEXT_TIER, 256),
};

export const InAModal: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="cinnabar" width="narrow">
			<Modal label="Carry 8 free weight">
				<PlanChange {...planChangeFor(HELD_TIER, NEXT_TIER, 512)} />
			</Modal>
		</Screen>
	),
};
