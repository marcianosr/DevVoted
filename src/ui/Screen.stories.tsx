import type { Meta, StoryObj } from "@storybook/react";

import { Screen } from "./Screen.ui";

const meta: Meta<typeof Screen> = {
	component: Screen,
	title: "Layout/Screen",
	args: {
		children: (
			<div className="border border-zinc-700 p-6">
				<h1 className="text-2xl">Screen content</h1>
				<p className="text-gray-400">
					Centered, responsive width. Resize the viewport to see the frame.
				</p>
			</div>
		),
	},
};
export default meta;

type Story = StoryObj<typeof Screen>;

export const Default: Story = {};

export const Narrow: Story = { args: { width: "narrow" } };

export const Wide: Story = { args: { width: "wide" } };

export const FadeIn: Story = { args: { transition: "fade" } };

export const SlideUp: Story = { args: { transition: "slide-up" } };

export const SlideRight: Story = { args: { transition: "slide-right" } };

export const SlideLeft: Story = { args: { transition: "slide-left" } };

export const EdgeActions: Story = {
	args: {
		leftAction: { label: "← Review answer", onClick: () => {} },
		rightAction: { label: "Go to shop →", onClick: () => {} },
	},
};

export const OnlyRightAction: Story = {
	args: { rightAction: { label: "Continue →", onClick: () => {} } },
};
