import type { Meta, StoryObj } from "@storybook/react";

import { KANTO_QUIZ } from "~/test/kanto";
import { MarkdownText, QuestionMarkdown } from "./PollMarkdown.ui";

const meta: Meta<typeof QuestionMarkdown> = {
	component: QuestionMarkdown,
	title: "Polls/PollMarkdown",
};
export default meta;

type Story = StoryObj<typeof QuestionMarkdown>;

export const PlainQuestion: Story = {
	args: { children: KANTO_QUIZ[0].question },
};

export const QuestionWithCodeBlock: Story = {
	args: {
		children: [
			"What does this log for Misty's badge?",
			"",
			"```js",
			'const badges = ["Boulder Badge", "Cascade Badge"];',
			"console.log(badges.at(-1));",
			"```",
		].join("\n"),
	},
};

// MarkdownText escapes stray markdown/HTML so free-text options render
// literally — the tag and blockquote marker below stay visible as text.
export const EscapedFreeText: Story = {
	render: () => (
		<MarkdownText>
			{"<GymBadge /> renders `> 8` badges in Viridian City"}
		</MarkdownText>
	),
};
