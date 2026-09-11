import type { Meta, StoryObj } from "@storybook/react";

import { CONFIG_SIZES } from "~/modules/run/config/domain/config.model";

import { KANTO_COLORS } from "./colors";
import { Screen } from "./Screen.ui";
import { Weight } from "./Weight.ui";

const LADDER = "flex flex-col gap-2";

const meta: Meta<typeof Weight> = {
	component: Weight,
	title: "Kanto/Weight",
	argTypes: { slots: { control: { type: "range", min: 1, max: 16 } } },
	args: { slots: 2 },
	render: (args) => (
		<Screen theme="vermillion" width="narrow">
			<Weight {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Weight>;

export const TwoSlots: Story = {};

export const OneSlot: Story = { args: { slots: 1 } };

export const Biggest: Story = { args: { slots: 16 } };

export const EverySize: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<div className={LADDER}>
				{CONFIG_SIZES.map((slots) => (
					<Weight key={slots} slots={slots} />
				))}
			</div>
		</Screen>
	),
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:8rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme} width="narrow">
					<Weight slots={4} />
				</Screen>
			))}
		</div>
	),
};
