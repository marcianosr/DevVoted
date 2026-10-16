import type { Meta, StoryObj } from "@storybook/react";

import { ProfileSeats } from "./ProfileSeats.ui";

const meta: Meta<typeof ProfileSeats> = {
	component: ProfileSeats,
	title: "Kanto/Profile/ProfileSeats",
	parameters: { controls: { disable: true } },
};

export default meta;

type Story = StoryObj<typeof ProfileSeats>;

export const TwoSeats: Story = {
	args: {
		meta: "2 seats held",
		seats: [
			{ category: "CSS", figure: "21 in a row" },
			{ category: "General Frontend", figure: "16 in a row" },
		],
	},
};
