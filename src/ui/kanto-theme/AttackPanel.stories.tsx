import type { Meta, StoryObj } from "@storybook/react";

import {
	kantoAttackPanel,
	kantoAttackPanelDealing,
	kantoAttackPanelHealthy,
	kantoAttackPanelInspected,
	kantoAttackPanelNoRival,
	kantoAttackPanelUnarmed,
} from "~/test/kantoIncidents.factory";

import { AttackPanel } from "./AttackPanel.ui";

const meta: Meta<typeof AttackPanel> = {
	component: AttackPanel,
	title: "Kanto/Panels/AttackPanel",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof AttackPanel>;

export const Perfect: Story = {
	render: () => <AttackPanel {...kantoAttackPanel()} />,
};

export const Inspected: Story = {
	render: () => <AttackPanel {...kantoAttackPanelInspected()} />,
};

export const Healthy: Story = {
	render: () => <AttackPanel {...kantoAttackPanelHealthy()} />,
};

export const Unarmed: Story = {
	render: () => <AttackPanel {...kantoAttackPanelUnarmed()} />,
};

export const NoRivalInRange: Story = {
	render: () => <AttackPanel {...kantoAttackPanelNoRival()} />,
};

export const Dealing: Story = {
	render: () => <AttackPanel {...kantoAttackPanelDealing()} />,
};
