import type { Meta, StoryObj } from "@storybook/react";

import {
	kantoIncidents,
	kantoIncidentsQuiet,
} from "~/test/kantoIncidents.factory";

import { IncidentsPanel } from "./IncidentsPanel.ui";
import { Screen } from "./Screen.ui";

const meta: Meta<typeof IncidentsPanel> = {
	component: IncidentsPanel,
	title: "Kanto/IncidentsPanel",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<Screen theme="saffron" width="narrow">
			<IncidentsPanel {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof IncidentsPanel>;

/** The day's public log on the board; the viewer's own rows are ringed. */
export const Today: Story = { args: kantoIncidents() };

export const QuietDay: Story = { args: kantoIncidentsQuiet() };
