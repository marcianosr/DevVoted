import type { ReactNode } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { kantoStanding } from "~/test/kantoCommunity.factory";

import { Screen } from "./Screen.ui";
import { Standing } from "./Standing.ui";

const meta: Meta<typeof Standing> = {
	component: Standing,
	title: "Kanto/Profile/Standing",
	parameters: { controls: { disable: true } },
};

export default meta;

type Story = StoryObj<typeof Standing>;

const on = (children: ReactNode) => (
	<div className="[--screen-floor:8rem]">
		<Screen theme="lavender">
			<div className="w-full sm:w-112">{children}</div>
		</Screen>
	</div>
);

export const ARunInProgress: Story = {
	render: () => on(<Standing {...kantoStanding()} />),
};

export const NothingInstalled: Story = {
	render: () =>
		on(
			<Standing
				{...kantoStanding({
					build: [],
					freeSlots: 4,
					weight: "0 of 4 weight",
				})}
			/>
		),
};

export const AFullBuild: Story = {
	render: () => on(<Standing {...kantoStanding({ freeSlots: 0 })} />),
};
