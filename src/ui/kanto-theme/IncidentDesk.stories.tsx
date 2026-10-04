import type { Meta, StoryObj } from "@storybook/react";

import { kantoIncidentDesk } from "~/test/kantoIncidentDesk.factory";

import { IncidentDesk } from "./IncidentDesk.ui";
import { Screen } from "./Screen.ui";

const meta: Meta<typeof IncidentDesk> = {
	component: IncidentDesk,
	title: "Kanto/IncidentDesk",
	render: (args) => (
		<Screen theme="saffron" width="narrow">
			<IncidentDesk {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof IncidentDesk>;

export const Offered: Story = { args: kantoIncidentDesk() };

export const ReplacingWhatYouHold: Story = {
	args: kantoIncidentDesk({ heldAudit: "not-found" }),
};

export const RefreshedTwice: Story = {
	args: kantoIncidentDesk({ refreshes: 2, refreshCostKb: 32 }),
};

export const NobodyInReach: Story = {
	args: kantoIncidentDesk({ rivalsInReach: 0 }),
};

export const Short: Story = { args: kantoIncidentDesk({ balanceKb: 8 }) };

export const ShopReadOnly: Story = {
	args: kantoIncidentDesk({ shopLocked: true }),
};
