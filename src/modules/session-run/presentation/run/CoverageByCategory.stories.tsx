import type { Meta, StoryObj } from "@storybook/react";

import { CoverageByCategory } from "./CoverageByCategory.ui";

const meta: Meta<typeof CoverageByCategory> = {
	component: CoverageByCategory,
	title: "SessionRun/CoverageByCategory",
};
export default meta;

type Story = StoryObj<typeof CoverageByCategory>;

export const Mixed: Story = {
	args: { coverageByCategory: { css: 5.5, js: 12, git: 2.5 } },
};

export const Empty: Story = {
	args: { coverageByCategory: {} },
};
