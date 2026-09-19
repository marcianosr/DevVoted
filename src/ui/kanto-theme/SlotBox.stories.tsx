import type { Meta, StoryObj } from "@storybook/react";

import { Screen } from "./Screen.ui";
import { SlotBox } from "./SlotBox.ui";

const COLUMN = "flex w-full flex-col gap-3";

const meta: Meta<typeof SlotBox> = {
	component: SlotBox,
	title: "Kanto/SlotBox",
	render: (args) => (
		<Screen theme="vermillion" width="narrow">
			<SlotBox {...args} />
		</Screen>
	),
};

export default meta;
type Story = StoryObj<typeof SlotBox>;

export const AVacancy: Story = { args: {} };

export const ABuildHoldingNothing: Story = {
	args: { label: "nothing installed yet" },
};

export const EveryFreeSlot: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<div className={COLUMN}>
				<SlotBox />
				<SlotBox />
				<SlotBox />
			</div>
		</Screen>
	),
};
