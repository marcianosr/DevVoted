import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import { Pipeline } from "./Pipeline.ui";

const meta: Meta<typeof Pipeline> = {
	component: Pipeline,
	title: "Session Run/Pipeline",
};
export default meta;

type Story = StoryObj<typeof Pipeline>;

export const PartlyFilled: Story = {
	args: { configs: [CONFIGS.js, CONFIGS.eslint], slots: 3 },
};
export const Full: Story = {
	args: {
		configs: [CONFIGS.js, CONFIGS.copilot, CONFIGS.coverageGain],
		slots: 3,
	},
};
export const Removable: Story = {
	args: {
		configs: [CONFIGS.js, CONFIGS.copilot],
		slots: 4,
		onRemove: () => {},
	},
};
