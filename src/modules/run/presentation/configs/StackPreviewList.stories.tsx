import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { preRunRoleRows } from "~/modules/run/gate/configRole.model";
import { StackPreviewList } from "./StackPreviewList.ui";

const meta: Meta<typeof StackPreviewList> = {
	component: StackPreviewList,
	title: "Run/StackPreviewList",
};
export default meta;

type Story = StoryObj<typeof StackPreviewList>;

export const TestEverything: Story = {
	args: {
		rows: preRunRoleRows([CONFIGS.js, CONFIGS.ts, CONFIGS.eslint], []),
	},
};

export const ShipIt: Story = {
	args: {
		rows: preRunRoleRows([CONFIGS.js, CONFIGS.jsx, CONFIGS.codeCoverage], []),
	},
};
