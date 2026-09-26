import type { Meta, StoryObj } from "@storybook/react";

import {
	kantoGateZeroFooter,
	kantoPrepChampion,
	kantoPrepSealed,
} from "~/test/kantoPoll.factory";

import { Screen } from "./Screen.ui";
import { ScreenFooter } from "./ScreenFooter.ui";

const meta: Meta<typeof ScreenFooter> = {
	component: ScreenFooter,
	title: "Kanto/ScreenFooter",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<Screen theme="viridian" width="default">
			<ScreenFooter {...args} />
		</Screen>
	),
	args: kantoGateZeroFooter(),
};
export default meta;

type Story = StoryObj<typeof ScreenFooter>;

export const BareBuild: Story = {};

export const ReadyToStart: Story = { args: kantoGateZeroFooter(true) };

export const TwoStakes: Story = { args: kantoPrepSealed().footer };

export const CostWithNews: Story = { args: kantoPrepChampion().footer };
