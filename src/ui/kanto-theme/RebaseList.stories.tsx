import type { Meta, StoryObj } from "@storybook/react";

import { RebaseList, type RebaseRow } from "./RebaseList.ui";
import { Screen } from "./Screen.ui";

const ROWS: readonly RebaseRow[] = [
	{ id: "poll-0", category: "React" },
	{ id: "poll-1", category: "CSS" },
	{ id: "poll-2", category: "TypeScript" },
	{ id: "poll-3", category: "Git" },
	{ id: "poll-4", category: "Python" },
];

const TYPED: readonly RebaseRow[] = ROWS.map((row, index) => ({
	...row,
	answerType: index % 2 === 0 ? "one answer" : "two answers",
}));

const HINT =
	"Put the categories you are surest of first — a streak pays, and the opener counts twice for some builds.";

const meta: Meta<typeof RebaseList> = {
	component: RebaseList,
	title: "Kanto/RebaseList",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<Screen theme="pallet" width="narrow">
			<RebaseList {...args} />
		</Screen>
	),
	args: {
		label: "git rebase -i",
		hint: HINT,
		rows: ROWS,
		onMove: () => {},
	},
};
export default meta;

type Story = StoryObj<typeof RebaseList>;

/** v1 lists subject lines, the way the real `rebase -i` does. */
export const Categories: Story = {};

/** v2 also names which polls take more than one answer, and those pay double. */
export const WithAnswerTypes: Story = {
	args: { rows: TYPED },
};

export const Locked: Story = {
	args: {
		onMove: undefined,
		refusal: "The gate has started — this order is the one you are running.",
	},
};
