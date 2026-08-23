import type { Meta, StoryObj } from "@storybook/react";

import { Text } from "./Text.ui";

const meta: Meta<typeof Text> = {
	component: Text,
	title: "Modern/Text",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Text>;

export const Ask: Story = {
	args: { size: "ask", children: "Don't ask me why these polls all rhyme" },
};

export const Title: Story = {
	args: { size: "title", children: "Gate 4 · Lavender" },
};

export const Label: Story = { args: { size: "label", children: "Pipeline" } };

export const Meta_: Story = {
	name: "Meta",
	args: { size: "meta", tone: "muted", children: "lift-the-final-two" },
};

export const Scale: Story = {
	render: () => (
		<div className="flex flex-col gap-3">
			<Text size="ask">ask</Text>
			<Text size="title">title</Text>
			<Text size="label">label</Text>
			<Text size="body">body</Text>
			<Text size="meta" tone="muted">
				meta
			</Text>
		</div>
	),
};

export const Tones: Story = {
	render: () => (
		<div className="flex flex-col gap-1">
			<Text tone="default">default</Text>
			<Text tone="muted">muted</Text>
			<Text tone="theme">theme</Text>
			<Text tone="celadon">celadon</Text>
			<Text tone="saffron">saffron</Text>
			<Text tone="cinnabar">cinnabar</Text>
			<Text tone="cerulean">cerulean</Text>
		</div>
	),
};
