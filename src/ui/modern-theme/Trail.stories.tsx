import type { Meta, StoryObj } from "@storybook/react";

import { Trail } from "./Trail.ui";

const meta: Meta<typeof Trail> = {
	component: Trail,
	title: "Modern/Trail",
};
export default meta;

type Story = StoryObj<typeof Trail>;

export const MidWindow: Story = {
	args: {
		label: "Polls in this gate",
		items: [
			{ id: "1", label: "1", state: "done", verdict: "correct" },
			{ id: "2", label: "2", state: "done", verdict: "partial" },
			{ id: "3", label: "3", state: "current" },
			{ id: "4", label: "4", state: "todo" },
			{ id: "5", label: "5", state: "todo" },
		],
	},
};

export const FirstPoll: Story = {
	args: {
		label: "Polls in this gate",
		items: [
			{ id: "1", label: "1", state: "current" },
			{ id: "2", label: "2", state: "todo" },
			{ id: "3", label: "3", state: "todo" },
			{ id: "4", label: "4", state: "todo" },
			{ id: "5", label: "5", state: "todo" },
		],
	},
};

export const LastPoll: Story = {
	args: {
		label: "Polls in this gate",
		items: [
			{ id: "1", label: "1", state: "done", verdict: "correct" },
			{ id: "2", label: "2", state: "done", verdict: "partial" },
			{ id: "3", label: "3", state: "done", verdict: "wrong" },
			{ id: "4", label: "4", state: "done", verdict: "correct" },
			{ id: "5", label: "5", state: "current" },
		],
	},
};

export const EveryVerdict: Story = {
	args: {
		label: "Polls in this gate",
		items: [
			{ id: "1", label: "1", state: "done", verdict: "correct" },
			{ id: "2", label: "2", state: "done", verdict: "partial" },
			{ id: "3", label: "3", state: "done", verdict: "wrong" },
			{ id: "4", label: "4", state: "current" },
			{ id: "5", label: "5", state: "todo" },
		],
	},
};
