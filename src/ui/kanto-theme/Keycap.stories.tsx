import type { Meta, StoryObj } from "@storybook/react";

import { Keycap } from "./Keycap.ui";
import { Screen } from "./Screen.ui";

const ROW = "flex flex-wrap items-center gap-3";

const meta: Meta<typeof Keycap> = {
	component: Keycap,
	title: "Kanto/Keycap",
	argTypes: {
		answerType: { control: "inline-radio", options: ["single", "multiple"] },
		lit: { control: "boolean" },
	},
	args: { letter: "A" },
	render: (args) => (
		<Screen theme="cerulean" width="narrow">
			<Keycap {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Keycap>;

export const Single: Story = {};

export const EveryShape: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="cerulean" width="narrow">
			<div className={ROW}>
				<Keycap letter="A" />
				<Keycap letter="B" lit />
				<Keycap letter="C" answerType="multiple" />
				<Keycap letter="D" answerType="multiple" lit />
			</div>
		</Screen>
	),
};
