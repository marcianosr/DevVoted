import type { Meta, StoryObj } from "@storybook/react";

import {
	DependencyGrid,
	type DependencyGridProps,
	type GridTile,
} from "./DependencyGrid.ui";
import { Screen } from "./Screen.ui";

const tilesOf = (labels: readonly string[]): GridTile[] =>
	labels.map((label) => ({ id: label, label }));

const DEALT = tilesOf([
	"filter",
	"commit",
	"find",
	"margin",
	"reduce",
	"padding",
	"rebase",
	"map",
	"merge",
	"content",
	"cherry-pick",
	"border",
]);

const BOX_MODEL = ["margin", "padding", "content", "border"];

const noop = () => undefined;

const fresh: DependencyGridProps = {
	tiles: DEALT,
	groups: [],
	hints: [null, null, null],
	pickedIds: [],
	onPick: noop,
	onShuffle: noop,
};

const meta: Meta<typeof DependencyGrid> = {
	component: DependencyGrid,
	title: "Kanto/DependencyGrid",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<Screen theme="viridian" width="narrow">
			<DependencyGrid {...args} />
		</Screen>
	),
	args: fresh,
};
export default meta;

type Story = StoryObj<typeof DependencyGrid>;

export const Fresh: Story = {};

export const TwoPicked: Story = {
	args: { ...fresh, pickedIds: ["filter", "map"] },
};

export const OneSolved: Story = {
	args: {
		...fresh,
		tiles: DEALT.filter((tile) => !BOX_MODEL.includes(tile.id)),
		groups: [{ label: "Box model", tiles: BOX_MODEL, verdict: "right" }],
		hints: [null, null],
	},
};

export const NamesRevealed: Story = {
	args: { ...fresh, hints: ["Array methods", "Box model", "Git actions"] },
};

export const Revealed: Story = {
	args: {
		tiles: [],
		groups: [
			{ label: "Box model", tiles: BOX_MODEL, verdict: "right" },
			{
				label: "Array methods",
				tiles: ["filter", "reduce", "find", "map"],
				verdict: "wrong",
			},
			{
				label: "Git actions",
				tiles: ["commit", "rebase", "merge", "cherry-pick"],
				verdict: "wrong",
			},
		],
		hints: [],
		pickedIds: [],
		onPick: undefined,
		onShuffle: undefined,
	},
};
