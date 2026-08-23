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

export const Boxes: Story = {
	render: () => (
		<div className="flex gap-4">
			<Mark variant="blank" shape="box" />
			<Mark variant="fail" shape="box" />
			<Mark variant="pass" shape="box" />
		</div>
	),
};
