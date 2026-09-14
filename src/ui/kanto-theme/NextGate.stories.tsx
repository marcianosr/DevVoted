import type { Meta, StoryObj } from "@storybook/react";

import { kantoNextGateAt } from "~/test/kantoPoll.factory";

import { NextGate, type NextGateProps } from "./NextGate.ui";
import { Screen } from "./Screen.ui";

const propsAt = (cleared: number, unitsHeld: number): NextGateProps => {
	const next = kantoNextGateAt(cleared, unitsHeld);

	if (next === undefined)
		throw new Error(`gate ${cleared} has no gate after it`);

	return next;
};

const SHORT_OF_THE_LINE = propsAt(9, 41);

const meta: Meta<typeof NextGate> = {
	component: NextGate,
	title: "Kanto/NextGate",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<Screen gate={args.swatch.theme} width="narrow" ground="bare">
			<NextGate {...args} />
		</Screen>
	),
	args: SHORT_OF_THE_LINE,
};
export default meta;

type Story = StoryObj<typeof NextGate>;

export const ShortOfTheLine: Story = {};

export const AlreadyClearing: Story = { args: propsAt(9, 45) };

export const TheFirstGate: Story = { args: propsAt(0, 0) };

export const TheSummit: Story = { args: propsAt(11, 58) };
