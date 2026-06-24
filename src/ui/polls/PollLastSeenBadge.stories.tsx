import type { Meta, StoryObj } from "@storybook/react";
import { PollLastSeenBadge } from "./PollLastSeenBadge.ui";

const meta: Meta<typeof PollLastSeenBadge> = {
	component: PollLastSeenBadge,
	title: "Polls/PollLastSeenBadge",
};
export default meta;

type Story = StoryObj<typeof PollLastSeenBadge>;

export const NeverSeen: Story = {
	args: {
		lastSeenAt: null,
		lastEncounteredAt: null,
		timesEncountered: 0,
	},
};

export const SeenBefore: Story = {
	args: {
		lastSeenAt: "2026-06-17",
		lastEncounteredAt: new Date("2026-03-13T10:00:00Z"),
		timesEncountered: 3,
	},
};

export const SeenRecentlyNeverPersonal: Story = {
	args: {
		lastSeenAt: "2026-06-23",
		lastEncounteredAt: null,
		timesEncountered: 0,
	},
};
