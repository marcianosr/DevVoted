import type { Meta, StoryObj } from "@storybook/react";

import { createKantoPollFactsProps } from "~/test/kantoPoll.factory";

import { Panel } from "./Panel.ui";
import { PollFacts } from "./PollFacts.ui";

const PANEL_LABEL = "Poll 4 out of 5";
const FACTS_TRAILING = "7 options · single answer";

const meta = {
	title: "Kanto/PollFacts",
	component: PollFacts,
	args: {
		...createKantoPollFactsProps(),
		trailing: FACTS_TRAILING,
	},
	render: (args) => (
		<Panel>
			<Panel.Header label={PANEL_LABEL} />
			<PollFacts {...args} />
			<Panel.Body className="border-t border-theme-faint">
				The question would be here.
			</Panel.Body>
		</Panel>
	),
} satisfies Meta<typeof PollFacts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Brutal: Story = {};

export const Hard: Story = {
	args: {
		difficulty: {
			badge: "hard",
			tone: "saffron",
			figure: "44%",
			text: "got it right first time",
		},
		history: undefined,
	},
};

export const Fair: Story = {
	args: {
		difficulty: {
			badge: "fair",
			tone: "celadon",
			figure: "71%",
			text: "got it right first time",
		},
		history: undefined,
	},
};

export const Easy: Story = {
	args: {
		difficulty: {
			badge: "easy",
			tone: "viridian",
			figure: "92%",
			text: "got it right first time",
		},
		history: undefined,
	},
};

export const Untested: Story = {
	args: {
		difficulty: {
			badge: "untested",
			tone: "pewter",
			text: "too few first tries to say",
		},
		history: undefined,
	},
};

export const NeverSeen: Story = {
	args: { history: undefined },
};

export const SeenAndCracked: Story = {
	args: {
		history: {
			badge: "seen before",
			tone: "saffron",
			text: "answered twice · you got it right both times, last on 4 Aug",
		},
	},
};
