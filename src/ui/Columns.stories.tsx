import type { Meta, StoryObj } from "@storybook/react";

import { Columns } from "./Columns.ui";

const Panel = ({ label }: { label: string }) => (
	<div className="rounded-lg border border-edge-strong p-6 text-white">
		{label}
	</div>
);

const meta: Meta<typeof Columns> = {
	component: Columns,
	title: "Layout/Columns",
};
export default meta;

type Story = StoryObj<typeof Columns>;

export const WithAside: Story = {
	args: {
		aside: <Panel label="Aside — gym leader roster (1/3)" />,
		main: <Panel label="Main — Indigo Plateau briefing (2/3)" />,
	},
};

export const MainOnly: Story = {
	args: {
		main: <Panel label="Main spans the full width when there is no aside" />,
	},
};
