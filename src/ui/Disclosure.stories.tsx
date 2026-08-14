import type { Meta, StoryObj } from "@storybook/react";

import { Disclosure } from "./Disclosure.ui";
import { Paragraph } from "./typography/Paragraph.component";

// Game-design reason: the distractors you talked yourself out of are worth
// keeping, but not worth nine lines between you and the next question. The fold
// is how both screens that review an answer hold that line.
const meta: Meta<typeof Disclosure> = {
	component: Disclosure,
	title: "UI/Disclosure",
	decorators: [
		(Story) => (
			<div className="w-96 font-mono">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Disclosure>;

const distractors = [":root()", ":scope()", ":is()", ":where()"];

const Options = () => (
	<div className="space-y-1.5">
		{distractors.map((option) => (
			<Paragraph key={option} tone="muted">
				{option}
			</Paragraph>
		))}
	</div>
);

/** The gate review's tail: options neither side of the diff touched. */
export const Closed: Story = {
	args: {
		summary: "4 other options",
		children: <Options />,
	},
};

/**
 * The community board's tail carries a vote count, because there the hidden
 * options did draw a crowd — the summary has to say so or the fold reads empty.
 */
export const WithVotes: Story = {
	args: {
		summary: "4 other options, 3 votes",
		children: <Options />,
	},
};

export const Open: Story = {
	args: {
		summary: "4 other options",
		defaultOpen: true,
		children: <Options />,
	},
};
