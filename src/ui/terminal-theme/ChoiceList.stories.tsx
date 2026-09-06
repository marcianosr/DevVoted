import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./Badge.ui";
import { ChoiceList } from "./ChoiceList.ui";

const noop = () => {};

const meta: Meta<typeof ChoiceList> = {
	component: ChoiceList,
	title: "Terminal/ChoiceList",
	decorators: [
		(Story) => (
			<div data-swatch-theme="viridian" className="w-[700px] p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof ChoiceList>;

const ANSWERS = [
	{ letter: "A", label: "at(−1)" },
	{ letter: "B", label: "pop()" },
	{ letter: "C", label: "shift()" },
	{ letter: "D", label: "slice(−1)" },
	{ letter: "E", label: "last()" },
	{ letter: "F", label: "tail()" },
	{ letter: "G", label: "peek()" },
	{ letter: "H", label: "head()" },
];

/** The keycap is the whole keyboard cue: A–H pick the answer they carry. */
export const EightAnswers: Story = {
	args: {
		choices: ANSWERS.map((answer) => ({
			...answer,
			selected: answer.letter === "C",
		})),
		onPick: noop,
	},
};

/** 451 seals an answer: the row keeps its key and stays pickable, and the
 * price of reading it sits where the text would have been. */
export const OneSealed: Story = {
	args: {
		choices: ANSWERS.map((answer) => ({
			letter: answer.letter,
			label: answer.letter === "H" ? "?????" : answer.label,
			selected: answer.letter === "C",
			seal:
				answer.letter === "H"
					? {
							price: "4 KB",
							hint: "Unseal this answer for 4 KB",
							onUnseal: noop,
						}
					: undefined,
		})),
		onPick: noop,
	},
};

/** Settled: no keys, no tip, and the marks carry the verdict. */
export const Revealed: Story = {
	args: {
		choices: [
			{
				letter: "A",
				label: "at(−1)",
				state: "expected",
				note: <Badge tone="viridian">expected · you picked</Badge>,
			},
			{ letter: "B", label: "pop()", state: "dimmed" },
			{
				letter: "C",
				label: "shift()",
				state: "crossedOut",
				note: "crossed out",
			},
		],
	},
};
