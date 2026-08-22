import type { Meta, StoryObj } from "@storybook/react";

import { Tabs } from "./Tabs.ui";

// Game-design reason: a poll has more behind it than the question — its source,
// the answer, the timing. Tabs are how a player digs without losing the question.
const meta: Meta<typeof Tabs> = {
	component: Tabs,
	title: "Skin/Tabs",
	args: {
		label: "Poll detail",
		tabs: [
			{ id: "question", label: "Question", state: "active" },
			{ id: "source", label: "Source" },
			{ id: "answer", label: "Answer" },
			{ id: "explanation", label: "Explanation", state: "disabled" },
			{ id: "timing", label: "Timing" },
		],
	},
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="w-[40rem] bg-surface">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Tabs>;

/** Explanation is disabled until the poll is answered. */
export const PollDetail: Story = {};

export const AllOpen: Story = {
	args: {
		tabs: [
			{ id: "question", label: "Question" },
			{ id: "source", label: "Source", state: "active" },
			{ id: "answer", label: "Answer" },
			{ id: "explanation", label: "Explanation" },
			{ id: "timing", label: "Timing" },
		],
	},
};
