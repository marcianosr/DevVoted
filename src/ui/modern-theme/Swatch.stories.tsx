import type { Meta, StoryObj } from "@storybook/react";

import { Swatch } from "./Swatch.ui";

const meta: Meta<typeof Swatch> = {
	component: Swatch,
	title: "Modern/Swatch",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Swatch>;

export const Badge: Story = { args: { size: "badge" } };
export const Pip: Story = { args: { size: "pip" } };

export const Overridden: Story = { args: { size: "badge", theme: "volcano" } };

export const EveryGate: Story = {
	render: () => (
		<div className="flex gap-2">
			{["pallet", "cascade", "thunder", "marsh", "volcano", "lavender"].map(
				(theme) => (
					<Swatch key={theme} size="badge" theme={theme} />
				)
			)}
		</div>
	),
};
