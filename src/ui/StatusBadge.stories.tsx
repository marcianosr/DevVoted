import type { Meta, StoryObj } from "@storybook/react";

import { StatusBadge } from "./StatusBadge.ui";

const meta: Meta<typeof StatusBadge> = {
	component: StatusBadge,
	title: "UI/StatusBadge",
};
export default meta;

type Story = StoryObj<typeof StatusBadge>;

export const AllVariants: Story = {
	render: () => (
		<div className="flex gap-2">
			<StatusBadge variant="pass" />
			<StatusBadge variant="part" />
			<StatusBadge variant="fail" />
			<StatusBadge variant="skip" />
			<StatusBadge variant="run" />
		</div>
	),
};
