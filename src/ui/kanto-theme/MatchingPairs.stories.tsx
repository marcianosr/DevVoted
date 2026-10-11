import type { Meta, StoryObj } from "@storybook/react";

import {
	MatchingPairs,
	type MatchingPairsProps,
	type PairTile,
	type PairTileState,
} from "./MatchingPairs.ui";
import { Screen } from "./Screen.ui";

const tileOf = (label: string, state: PairTileState = "open"): PairTile => ({
	id: label,
	label,
	state,
});

const LEFT = ["div ~ div", "div + div", "div div", "div > div"];
const RIGHT = [
	"a direct child",
	"any descendant",
	"the next sibling",
	"any later sibling",
];

const noop = () => undefined;

const fresh: MatchingPairsProps = {
	left: LEFT.map((label) => tileOf(label)),
	right: RIGHT.map((label) => tileOf(label)),
	pickedIds: [],
	onPick: noop,
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

export const OnePicked: Story = {
	args: { ...fresh, pickedIds: ["div + div"] },
};

export const OneMatchedOneMissed: Story = {
	args: {
		...fresh,
		left: [
			tileOf("div ~ div", "missed"),
			tileOf("div + div"),
			tileOf("div div"),
			tileOf("div > div", "matched"),
		],
		right: [
			tileOf("a direct child", "matched"),
			tileOf("any descendant"),
			tileOf("the next sibling"),
			tileOf("any later sibling", "missed"),
		],
	},
};

export const Answered: Story = {
	args: {
		left: [
			tileOf("div + div", "matched"),
			tileOf("div > div", "matched"),
			tileOf("div ~ div", "missed"),
			tileOf("div div", "missed"),
		],
		right: [
			tileOf("the next sibling", "matched"),
			tileOf("a direct child", "matched"),
			tileOf("any later sibling", "missed"),
			tileOf("any descendant", "missed"),
		],
		pickedIds: [],
		onPick: undefined,
	},
};
