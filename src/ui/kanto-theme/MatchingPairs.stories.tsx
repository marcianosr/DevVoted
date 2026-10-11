import type { Meta, StoryObj } from "@storybook/react";

import {
	MatchingPairs,
	type MatchingPairsProps,
	type PairTile,
	type PairVerdict,
} from "./MatchingPairs.ui";
import { Screen } from "./Screen.ui";

const tileOf = (label: string, verdict?: PairVerdict): PairTile => ({
	id: label,
	label,
	...(verdict === undefined ? {} : { verdict }),
});

const LEFT = ["`:has()`", "`:is()`", "`:not()`", "`:where()`"];
const RIGHT = [
	"Matches any in the list, takes the highest specificity",
	"Picks an element by what it contains",
	"Matches any in the list, adds zero specificity",
	"Matches what the list doesn't",
];
const PARTNERS = [RIGHT[1], RIGHT[0], RIGHT[3], RIGHT[2]];

const noop = () => undefined;

const fresh: MatchingPairsProps = {
	left: LEFT.map((label) => tileOf(label)),
	right: RIGHT.map((label) => tileOf(label)),
	onPick: noop,
	onClear: noop,
};

const meta: Meta<typeof MatchingPairs> = {
	component: MatchingPairs,
	title: "Kanto/MatchingPairs",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<Screen theme="viridian" width="narrow">
			<MatchingPairs {...args} />
		</Screen>
	),
	args: fresh,
};
export default meta;

type Story = StoryObj<typeof MatchingPairs>;

export const Fresh: Story = {};

export const OneWaiting: Story = {
	args: { ...fresh, pendingId: LEFT[0] },
};

export const TwoLinked: Story = {
	args: {
		...fresh,
		links: [
			{ left: LEFT[2], right: RIGHT[2] },
			{ left: LEFT[3], right: RIGHT[1] },
		],
	},
};

export const AllLinked: Story = {
	args: {
		...fresh,
		links: LEFT.map((left, row) => ({ left, right: RIGHT[row] })),
	},
};

const answeredOf = (verdicts: readonly PairVerdict[]): MatchingPairsProps => ({
	left: LEFT.map((label, row) => tileOf(label, verdicts[row])),
	right: PARTNERS.map((label, row) => tileOf(label, verdicts[row])),
	links: LEFT.map((left, row) => ({ left, right: PARTNERS[row] })),
});

export const Answered: Story = {
	args: {
		left: LEFT.map((label) => tileOf(label)),
		right: PARTNERS.map((label) => tileOf(label)),
		links: [
			{ left: LEFT[0], right: PARTNERS[0], verdict: "matched" },
			{ left: LEFT[1], right: PARTNERS[1], verdict: "matched" },
			{ left: LEFT[2], right: PARTNERS[3], verdict: "missed" },
			{ left: LEFT[3], right: PARTNERS[2], verdict: "missed" },
		],
	},
};

export const AnswerKey: Story = {
	args: answeredOf(["matched", "matched", "matched", "matched"]),
};
