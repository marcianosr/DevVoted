import type { Meta, StoryObj } from "@storybook/react";

import { kantoStanding } from "~/test/kantoCommunity.factory";

import { ProfileClimbing } from "./ProfileClimbing.ui";

const meta: Meta<typeof ProfileClimbing> = {
	component: ProfileClimbing,
	title: "Kanto/Profile/ProfileClimbing",
	parameters: { controls: { disable: true } },
};

export default meta;

type Story = StoryObj<typeof ProfileClimbing>;

export const ARunIsOpen: Story = {
	args: { standing: kantoStanding(), meta: "a run is open" },
};

export const NothingOpen: Story = {
	args: { meta: "nothing open" },
};
