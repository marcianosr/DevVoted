import type { Meta, StoryObj } from "@storybook/react";

import { Title } from "./Title.component";

const meta: Meta<typeof Title> = {
	component: Title,
	title: "Design System/Typography/Title",
};
export default meta;

type Story = StoryObj<typeof Title>;

export const Default: Story = {
	args: { children: "Gate 3 — the climb steepens" },
};

export const AsSectionHeading: Story = {
	args: {
		children: "Your pipeline",
		as: "h2",
	},
};

/** The three levels together — the step a screen reader announces is the step you see. */
export const Levels: Story = {
	render: () => (
		<div className="flex flex-col gap-2">
			<Title as="h1">Upgrade your pipeline</Title>
			<Title as="h2">Your pipeline</Title>
			<Title as="h3">Gate modifiers</Title>
		</div>
	),
};

/** A heading carrying the news, in the same tones Paragraph uses for it. */
export const Toned: Story = {
	render: () => (
		<div className="flex flex-col gap-2">
			<Title tone="gradient">And now it&apos;s green!</Title>
			<Title tone="cinnabar">Build broke!</Title>
		</div>
	),
};
