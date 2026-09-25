import type { Meta, StoryObj } from "@storybook/react";

import {
	kantoAudits,
	kantoAuditsLocked,
	kantoAuditsNoSender,
	kantoAuditsQuiet,
} from "~/test/kantoIncidents.factory";

import { AuditsPanel } from "./AuditsPanel.ui";

const meta: Meta<typeof AuditsPanel> = {
	component: AuditsPanel,
	title: "Kanto/Panels/AuditsPanel",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof AuditsPanel>;

/** Two rivals reached this gate, and the row names each of them. */
export const Firing: Story = {
	render: () => <AuditsPanel {...kantoAudits()} />,
};

/** A schedule dealt before rivals filled it still stands, unattributed. */
export const NoSender: Story = {
	render: () => <AuditsPanel {...kantoAuditsNoSender()} />,
};

/** Nobody fired. A calm gate is a real outcome, not a missing panel. */
export const Quiet: Story = {
	render: () => <AuditsPanel {...kantoAuditsQuiet()} />,
};

/** Below the floor the panel still draws, naming the gate that opens it. */
export const Locked: Story = {
	render: () => <AuditsPanel {...kantoAuditsLocked()} />,
};
