import type { Meta, StoryObj } from "@storybook/react";

import { SLICE_WINDOW } from "~/modules/run/rules.model";
import { PollOutcomeBar } from "./PollOutcomeBar.ui";

// Game-design reason for the story: the window is what a gate judges, so how it
// is going changes what the player risks on the polls that are left. The old
// "3 / 5" counter read the same whether you were cruising or about to break.
const meta: Meta<typeof PollOutcomeBar> = {
	component: PollOutcomeBar,
	title: "Run/PollOutcomeBar",
	args: { pollsPerGate: SLICE_WINDOW },
};
export default meta;

type Story = StoryObj<typeof PollOutcomeBar>;

// A fresh gate: nothing answered, everything still open.
export const Untouched: Story = { args: { outcomes: [] } };

// The mock's case — a good one, a miss, and a partial, two polls to go.
export const MidWindow: Story = {
	args: { outcomes: ["correct", "wrong", "partial"] },
};

// A window that has already gone wrong, with the checks still to satisfy.
export const Struggling: Story = {
	args: { outcomes: ["wrong", "wrong", "partial", "wrong"] },
};

// The flawless day every escalating Unit Tests check is asking for.
export const Perfect: Story = {
	args: {
		outcomes: ["correct", "correct", "correct", "correct", "correct"],
	},
};
