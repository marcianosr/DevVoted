import type { Meta, StoryObj } from "@storybook/react";

import { swatchTrackFor } from "~/modules/run/gate/application/swatchTrack.viewmodel";

import { Climber } from "./Climber.ui";
import { PlayerHeader } from "./PlayerHeader.ui";
import { Screen } from "./Screen.ui";

const meta: Meta<typeof PlayerHeader> = {
	component: PlayerHeader,
	title: "Kanto/PlayerHeader",
	args: {
		face: <Climber name="Marciano Schildmeijer" size="lg" />,
		name: "Marciano Schildmeijer",
		titles: ["Legacy Climber", "Legacy Tester"],
		contribution: { answered: 10, authored: { role: "Admin", published: 414 } },
		swatches: { fills: swatchTrackFor([0, 1]) },
	},
	render: (args) => (
		<Screen theme="cerulean" width="narrow">
			<PlayerHeader {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof PlayerHeader>;

export const Admin: Story = {};

export const Player: Story = {
	args: { contribution: { answered: 30 } },
};
