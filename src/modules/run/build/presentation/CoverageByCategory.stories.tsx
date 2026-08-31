import type { Meta, StoryObj } from "@storybook/react";

import { CoverageByCategory } from "~/modules/run/build/presentation/CoverageByCategory.ui";

const meta: Meta<typeof CoverageByCategory> = {
	component: CoverageByCategory,
	title: "Run/CoverageByCategory",
};
export default meta;

type Story = StoryObj<typeof CoverageByCategory>;

export const Mixed: Story = {
	args: { coverageByCategory: { css: 5.5, js: 12, git: 2.5 } },
};

export const Empty: Story = {
	args: { coverageByCategory: {} },
};
