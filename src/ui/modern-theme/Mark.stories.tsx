import type { Meta, StoryObj } from "@storybook/react";

import { Mark } from "./Mark.ui";

const meta: Meta<typeof Mark> = {
	component: Mark,
	title: "Modern/Mark",
};
export default meta;

type Story = StoryObj<typeof Mark>;

export const Pass: Story = { args: { variant: "pass" } };
export const Warn: Story = { args: { variant: "warn" } };
export const Fail: Story = { args: { variant: "fail" } };
export const Idle: Story = { args: { variant: "idle" } };

/** Filled discs for a verdict, an outline for idle — a column of six reads as
 * status at a glance, and the one config with nothing to say does not shout. */
export const AllVariants: Story = {
	render: () => (
		<div className="flex gap-4">
			<Mark variant="pass" />
			<Mark variant="warn" />
			<Mark variant="fail" />
			<Mark variant="idle" />
		</div>
	),
};

/** Boxes mark a poll category rather than a config, so a reward ledger can tell
 * the two apart down one column without reading either label. */
export const Boxes: Story = {
	render: () => (
		<div className="flex gap-4">
			<Mark variant="blank" shape="box" />
			<Mark variant="fail" shape="box" />
			<Mark variant="pass" shape="box" />
		</div>
	),
};
