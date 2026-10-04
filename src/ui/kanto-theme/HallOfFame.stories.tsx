import type { Meta, StoryObj } from "@storybook/react";

import { kantoHallOfFame } from "~/test/kantoCommunity.factory";

import { HallOfFame } from "./HallOfFame.ui";
import { Screen } from "./Screen.ui";

const meta: Meta<typeof HallOfFame> = {
	component: HallOfFame,
	title: "Kanto/HallOfFame",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof HallOfFame>;

const on = (children: React.ReactNode) => (
	<div className="[--screen-floor:8rem]">
		<Screen theme="lavender">
			<div className="w-full sm:w-112">{children}</div>
		</Screen>
	</div>
);

export const AReigningChampion: Story = {
	render: () => on(<HallOfFame {...kantoHallOfFame()} />),
};

export const NobodyHasSummited: Story = {
	render: () =>
		on(
			<HallOfFame {...kantoHallOfFame({ champion: undefined, history: [] })} />
		),
};
