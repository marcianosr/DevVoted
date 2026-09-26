import type { Meta, StoryObj } from "@storybook/react";

import { EstimatePicker, type EstimateCard } from "./EstimatePicker.ui";
import { Screen } from "./Screen.ui";

const CARDS: readonly EstimateCard[] = [
	{ count: 1, floor: "at least 1 of 5", payout: "+5%" },
	{ count: 2, floor: "at least 2 of 5", payout: "+10%" },
	{ count: 3, floor: "at least 3 of 5", payout: "+15%" },
	{ count: 4, floor: "at least 4 of 5", payout: "+20%" },
	{ count: 5, floor: "at least 5 of 5", payout: "+25%" },
];

const HINT =
	"Call how many of the five you will get right. Meet the number and it pays; fall short and it pays nothing.";

const meta: Meta<typeof EstimatePicker> = {
	component: EstimatePicker,
	title: "Kanto/EstimatePicker",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<Screen theme="pallet" width="narrow">
			<EstimatePicker {...args} />
		</Screen>
	),
	args: {
		label: "Planning Poker",
		hint: HINT,
		cards: CARDS,
		committed: null,
		onPick: () => {},
	},
};
export default meta;

type Story = StoryObj<typeof EstimatePicker>;

export const Open: Story = {};

export const Committed: Story = {
	args: { committed: 3 },
};

export const Locked: Story = {
	args: {
		committed: 3,
		onPick: undefined,
		refusal: "The gate has started — the bet is locked until it closes.",
	},
};
