import type { Meta, StoryObj } from "@storybook/react";

import {
	kantoGateClear,
	kantoGateClearFlawless,
	kantoGateClearOpen,
	kantoGateClearSummit,
} from "~/test/kantoGate.factory";

import { GateClearScreen } from "./GateClearScreen.ui";

const meta: Meta<typeof GateClearScreen> = {
	component: GateClearScreen,
	title: "Kanto/Screens/GateClearScreen",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof GateClearScreen>;

export const Cleared: Story = {
	render: () => <GateClearScreen {...kantoGateClear()} />,
};

export const AllOpen: Story = {
	render: () => <GateClearScreen {...kantoGateClearOpen()} />,
};

export const Flawless: Story = {
	render: () => <GateClearScreen {...kantoGateClearFlawless()} />,
};

export const Summit: Story = {
	render: () => <GateClearScreen {...kantoGateClearSummit()} />,
};
