import type { Meta, StoryObj } from "@storybook/react";

import { StatusDot } from "./StatusDot.ui";

const meta: Meta<typeof StatusDot> = {
	component: StatusDot,
	title: "UI/StatusDot",
};
export default meta;

type Story = StoryObj<typeof StatusDot>;

export const AllVariants: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<StatusDot variant="pass" />
			<StatusDot variant="part" />
			<StatusDot variant="fail" />
			<StatusDot variant="skip" />
			<StatusDot variant="run" />
		</div>
	),
};
