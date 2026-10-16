import type { Meta, StoryObj } from "@storybook/react";

import { Accuracy } from "./Accuracy.ui";
import { Screen } from "~/ui/kanto-theme/Screen.ui";

const meta: Meta<typeof Accuracy> = {
	component: Accuracy,
	title: "Kanto/Accuracy",
	render: (args) => (
		<Screen theme="lavender" width="narrow">
			<Accuracy {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Accuracy>;

export const Ahead: Story = {
	args: {
		track: {
			label: "Accuracy ×1.09, this gate up to ×1.13",
			figure: "×1.09",
			bonus: 0.36,
			cap: 0.52,
			ticks: [{ share: 0, label: "×1.00" }, { share: 1 }],
		},
	},
};

export const Landed: Story = {
	args: {
		landed: true,
		track: {
			label: "Accuracy ×1.08",
			figure: "×1.08",
			bonus: 0.32,
			cap: 0.32,
			ticks: [{ share: 0, label: "×1.00" }, { share: 1 }],
		},
	},
};
