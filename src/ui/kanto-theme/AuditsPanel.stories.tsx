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

export const Firing: Story = {
	render: () => <AuditsPanel {...kantoAudits()} />,
};

export const NoSender: Story = {
	render: () => <AuditsPanel {...kantoAuditsNoSender()} />,
};

export const Quiet: Story = {
	render: () => <AuditsPanel {...kantoAuditsQuiet()} />,
};

export const Locked: Story = {
	render: () => <AuditsPanel {...kantoAuditsLocked()} />,
};
