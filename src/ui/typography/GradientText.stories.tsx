import type { Meta, StoryObj } from "@storybook/react";

import { GradientText } from "./GradientText.component";

const meta: Meta<typeof GradientText> = {
	component: GradientText,
	title: "Design System/GradientText",
};
export default meta;

type Story = StoryObj<typeof GradientText>;

export const StorageReward: Story = {
	args: {
		className: "text-2xl font-bold",
		children: "+120KB storage",
	},
};

export const InlineInText: Story = {
	render: () => (
		<p className="text-lg text-zinc-100">
			You cleared the gate and banked{" "}
			<GradientText className="font-bold">+340KB</GradientText> to your vault.
		</p>
	),
};

export const Heading: Story = {
	args: {
		as: "h2",
		className: "text-4xl font-extrabold",
		children: "Coverage complete",
	},
};
