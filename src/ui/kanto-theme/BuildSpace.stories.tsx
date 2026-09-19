import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { kantoBuildSpace } from "~/test/kantoPoll.factory";

import { BuildSpace } from "./BuildSpace.ui";
import { KANTO_COLORS } from "./colors";
import { Screen } from "./Screen.ui";

const PickableSpace = () => {
	const [held, setHeld] = useState(8);
	const space = kantoBuildSpace(held);

	return (
		<Screen theme="vermillion" width="narrow">
			<BuildSpace
				{...space}
				rungs={space.rungs.map((rung) => ({
					...rung,
					onPick: rung.weight === held ? undefined : () => setHeld(rung.weight),
				}))}
			/>
		</Screen>
	);
};

const meta: Meta<typeof BuildSpace> = {
	component: BuildSpace,
	title: "Kanto/BuildSpace",
	args: kantoBuildSpace(),
	render: (args) => (
		<Screen theme="vermillion" width="narrow">
			<BuildSpace {...args} />
		</Screen>
	),
};

export default meta;
type Story = StoryObj<typeof BuildSpace>;

export const RoomToSpare: Story = {};

export const OnTheFreeRung: Story = {
	args: kantoBuildSpace(4, 3),
};

export const FullToTheMark: Story = {
	args: kantoBuildSpace(8, 8),
};

export const SteppedDownBelowItsOwnBuild: Story = {
	args: kantoBuildSpace(4, 7),
};

export const AtTheTopOfTheLadder: Story = {
	args: kantoBuildSpace(32, 28),
};

export const MoreRungsThanItCanDraw: Story = {
	args: { ...kantoBuildSpace(8, 5), more: 2 },
};

export const PickingARung: Story = {
	parameters: { controls: { disable: true } },
	render: () => <PickableSpace />,
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:9rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme} width="narrow">
					<BuildSpace {...kantoBuildSpace()} />
				</Screen>
			))}
		</div>
	),
};
