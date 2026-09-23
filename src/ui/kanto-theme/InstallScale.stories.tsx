import type { Meta, StoryObj } from "@storybook/react";

import { KANTO_COLORS } from "./colors";
import { InstallScale } from "./InstallScale.ui";
import { Screen } from "./Screen.ui";

const meta: Meta<typeof InstallScale> = {
	component: InstallScale,
	title: "Kanto/InstallScale",
	args: { from: 4, to: 6, perGateKb: 16 },
	render: (args) => (
		<Screen theme="vermillion" width="narrow">
			<InstallScale {...args} />
		</Screen>
	),
};

export default meta;
type Story = StoryObj<typeof InstallScale>;

export const OffTheFreeRung: Story = {};

/** The step that hurts: the ladder doubles, so every crossing costs more than the last. */
export const IntoTheTopRung: Story = {
	args: { from: 24, to: 32, perGateKb: 512 },
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:10rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme} width="narrow">
					<InstallScale from={8} to={12} perGateKb={64} />
				</Screen>
			))}
		</div>
	),
};
