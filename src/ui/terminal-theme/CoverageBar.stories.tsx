import type { Meta, StoryObj } from "@storybook/react";

import { CoverageBar } from "./CoverageBar.ui";

const meta: Meta<typeof CoverageBar> = {
	component: CoverageBar,
	title: "Terminal/CoverageBar",
	decorators: [
		(Story) => (
			<div data-swatch-theme="cascade" className="p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof CoverageBar>;

/** The window has barely started: the gate asks 10%, two polls have landed. */
export const Short: Story = {
	args: { held: 2.4, demand: 10 },
};

export const Met: Story = {
	args: { held: 10, demand: 10 },
};

/** Everything past the demand is the lighter tail — the spill the gate cannot
    ask for but the run still earned. */
export const Spilled: Story = {
	args: { held: 7.6, demand: 3 },
};

export const Untouched: Story = {
	args: { held: 0, demand: 25 },
};
