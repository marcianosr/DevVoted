import type { Meta, StoryObj } from "@storybook/react";

import { KANTO_COLORS } from "./colors";
import { Screen } from "./Screen.ui";
import { WornTitles } from "./WornTitles.ui";

const WORN = ["Legacy Tester", "Summit", "First Ascent"];

const meta: Meta<typeof WornTitles> = {
	component: WornTitles,
	title: "Kanto/WornTitles",
	args: { titles: WORN },
	render: (args) => (
		<Screen theme="cerulean" width="narrow">
			<WornTitles {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof WornTitles>;

export const Worn: Story = {};

export const One: Story = {
	args: { titles: ["Legacy Tester"] },
};

export const None: Story = {
	args: { titles: [] },
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:6rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme} width="narrow">
					<WornTitles titles={WORN} />
				</Screen>
			))}
		</div>
	),
};
