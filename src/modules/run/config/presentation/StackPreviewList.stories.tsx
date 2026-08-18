import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { roleRows } from "~/modules/run/gate/domain/configRole.model";
import { StackPreviewList } from "~/modules/run/config/presentation/StackPreviewList.ui";

const meta: Meta<typeof StackPreviewList> = {
	component: StackPreviewList,
	title: "Run/StackPreviewList",
};
export default meta;

type Story = StoryObj<typeof StackPreviewList>;

export const TestEverything: Story = {
	args: {
		rows: roleRows([CONFIGS.js, CONFIGS.ts, CONFIGS.eslint]),
	},
};

export const ShipIt: Story = {
	args: {
		rows: roleRows([CONFIGS.js, CONFIGS.jsx, CONFIGS.codeCoverage]),
	},
};
