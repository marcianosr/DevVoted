import type { Meta, StoryObj } from "@storybook/react";

import { Paragraph } from "./Paragraph.component";
import { Subtitle } from "./Subtitle.component";
import { Title } from "./Title.component";

const meta: Meta = {
	title: "UI/Typography",
	decorators: [
		(Story) => (
			<div className="max-w-2xl bg-[#141221] p-8 text-white">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj;

export const Title_: Story = {
	name: "Title",
	render: () => <Title>Upgrade your pipeline</Title>,
};

export const Subtitle_: Story = {
	name: "Subtitle",
	render: () => (
		<Subtitle>Choose one reward before climbing the next gate.</Subtitle>
	),
};

export const Paragraph_: Story = {
	name: "Paragraph",
	render: () => (
		<Paragraph>
			CSS polls earn 1.5× coverage — but if CSS shows, you must get one right.
		</Paragraph>
	),
};

/** Title tinted to the surrounding category theme (here: CSS → cerulean). */
export const ThemedTitle: Story = {
	render: () => <Title category="css">Configure your pipeline</Title>,
};

/** The three roles together, as they stack on a real screen header. */
export const Composition: Story = {
	render: () => (
		<div className="flex flex-col gap-3">
			<header>
				<Title>Your load-out</Title>
				<Subtitle>Your configured pipeline checks and effects</Subtitle>
			</header>
			<Paragraph>
				Requires 1 correct answer to pass the gate. Deeper gates cost more.
			</Paragraph>
		</div>
	),
};
