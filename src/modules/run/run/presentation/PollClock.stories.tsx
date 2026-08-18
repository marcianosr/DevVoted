import type { Meta, StoryObj } from "@storybook/react";

import { PollClock } from "~/modules/run/run/presentation/PollClock.ui";

const meta: Meta<typeof PollClock> = {
	component: PollClock,
	title: "Run/Poll/Clock",
};
export default meta;

type Story = StoryObj<typeof PollClock>;

export const Comfortable: Story = {
	args: { remainingMs: 24_000, limitMs: 30_000 },
};

/** Under ten seconds the whole chip turns, so the change is peripheral. */
export const Urgent: Story = {
	args: { remainingMs: 7_000, limitMs: 30_000 },
};

/** Nothing auto-submits: the poll is still answerable, it just scores as a miss. */
export const Expired: Story = {
	args: { remainingMs: 0, limitMs: 30_000 },
};
