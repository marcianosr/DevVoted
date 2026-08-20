import type { Meta, StoryObj } from "@storybook/react";

import { UpcomingCategories } from "~/modules/run/run/presentation/UpcomingCategories.ui";

const meta: Meta<typeof UpcomingCategories> = {
	component: UpcomingCategories,
	title: "Run/UpcomingCategories",
};
export default meta;

type Story = StoryObj<typeof UpcomingCategories>;

// Prefetch's whole product is this row: the draw stops being a surprise, so a
// player plans drafts and braces for weak categories instead of reacting.
// Three moments of the same run — the row shrinks as the window is played out.
export const GateStart: Story = {
	args: {
		thisGate: ["js", "css", "ts", "react", "git"],
		nextGate: ["java", "js", "css", "html", "ts"],
	},
};

export const MidGate: Story = {
	args: {
		thisGate: ["react", "git"],
		nextGate: ["java", "js", "css", "html", "ts"],
	},
};

/** Post-clear: the window has advanced, so the coming gate is "this gate" —
 * the shop's drafting view. */
export const AtTheShop: Story = {
	args: {
		thisGate: ["java", "js", "css", "html", "ts"],
		nextGate: [],
	},
};
