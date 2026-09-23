import type { Meta, StoryObj } from "@storybook/react";

import {
	kantoIncidents,
	kantoIncidentsQuiet,
} from "~/test/kantoIncidents.factory";

import { IncidentsScreen } from "./IncidentsScreen.ui";

const meta: Meta<typeof IncidentsScreen> = {
	component: IncidentsScreen,
	title: "Kanto/Screens/IncidentsScreen",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof IncidentsScreen>;

/** The day's public log; the viewer's own rows are ringed. */
export const Today: Story = {
	render: () => <IncidentsScreen {...kantoIncidents()} />,
};

export const QuietDay: Story = {
	render: () => <IncidentsScreen {...kantoIncidentsQuiet()} />,
};
