import type { Meta, StoryObj } from "@storybook/react";

import { RunReadout } from "./RunReadout.ui";
import { Screen } from "./Screen.ui";

const meta: Meta<typeof RunReadout> = {
	component: RunReadout,
	title: "Kanto/Run/RunReadout",
	parameters: { controls: { disable: true } },
	decorators: [
		(Story) => (
			<Screen theme="viridian">
				<Story />
			</Screen>
		),
	],
};

export default meta;

type Story = StoryObj<typeof RunReadout>;

export const MidRun: Story = { args: { runNumber: 2, gate: 4, gates: 12 } };

export const RunNumberLoading: Story = {
	args: { runNumber: null, gate: 0, gates: 12 },
};
