import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import { Loadout } from "./Loadout.ui";

const meta: Meta<typeof Loadout> = {
	component: Loadout,
	title: "Session Run/Pipeline/Loadout",
};
export default meta;

type Story = StoryObj<typeof Loadout>;

export const Default: Story = {
	args: {
		configs: [CONFIGS.unitTests, CONFIGS.css],
		slots: 3,
		onRemove: () => {},
	},
};
