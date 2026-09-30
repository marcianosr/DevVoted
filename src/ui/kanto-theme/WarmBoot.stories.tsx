import type { Meta, StoryObj } from "@storybook/react";

import { kantoBootedPanel, kantoWarmBootPanel } from "~/test/kantoPoll.factory";

import { Screen } from "./Screen.ui";
import { WarmBoot } from "./WarmBoot.ui";

const meta: Meta<typeof WarmBoot> = {
	component: WarmBoot,
	title: "Kanto/WarmBoot",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<Screen theme="pewter" width="narrow">
			<WarmBoot {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof WarmBoot>;

export const Untouched: Story = { args: kantoWarmBootPanel() };

export const Drafted: Story = {
	args: kantoWarmBootPanel(512, { rung: 1, serviceIds: ["pin"] }),
};

export const ArchiveShort: Story = { args: kantoWarmBootPanel(100) };

export const Booted: Story = { args: kantoBootedPanel() };
