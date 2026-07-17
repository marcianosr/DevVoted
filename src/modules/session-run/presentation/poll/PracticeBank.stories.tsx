import type { Meta, StoryObj } from "@storybook/react";

import { PracticeBank, type PracticeBankEntry } from "./PracticeBank.ui";

const meta: Meta<typeof PracticeBank> = {
	component: PracticeBank,
	title: "Session Run/PracticeBank",
};
export default meta;

type Story = StoryObj<typeof PracticeBank>;

const entries: PracticeBankEntry[] = [
	{
		id: "p1",
		category: "js",
		question: "Which method returns the last element of an array?",
		timesSeen: 3,
		lastSeen: "May 13",
	},
	{
		id: "p2",
		category: "css",
		question: "What does `position: sticky` fall back to when unsupported?",
		timesSeen: 1,
		lastSeen: "Dec 25",
	},
	{
		id: "p3",
		category: "react",
		question: "When does `useEffect`'s cleanup run on a dependency change?",
		timesSeen: 0,
	},
	{
		id: "p4",
		category: "ts",
		question: "What is the type of `keyof any`?",
		timesSeen: 5,
		lastSeen: "Jul 1",
	},
	{
		id: "p5",
		category: "git",
		question:
			"Which command rewrites history by moving commits onto a new base?",
		timesSeen: 2,
		lastSeen: "Jun 9",
	},
];

export const Stocked: Story = {
	args: { entries, totalCount: 475 },
};

export const Sparse: Story = {
	args: { entries: entries.slice(0, 2) },
};
