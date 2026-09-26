import type { Meta, StoryObj } from "@storybook/react";

import { GATE_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

import { Action } from "./Action.ui";
import { Screen } from "./Screen.ui";

const PALLET = GATE_SWATCHES[0];
const VOLCANO = GATE_SWATCHES[9];

const noop = () => undefined;

const meta: Meta<typeof Action> = {
	component: Action,
	title: "Kanto/Action",
	args: {
		label: `${PALLET.gateName} gate prep`,
		note: "2 configs · 3/4 weight",
		swatch: { state: "current", swatch: PALLET },
		onPress: noop,
	},
	render: (args) => (
		<Screen gate={PALLET.theme} width="narrow" ground="bare">
			<Action {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Action>;

export const Live: Story = {};

export const Refused: Story = {
	args: { note: "install at least one config", onPress: undefined },
};

export const CommittingAnAnswer: Story = {
	args: { label: "Lock in", note: "answer C" },
};

export const NothingPicked: Story = {
	args: { label: "Lock in", note: "pick an answer first", onPress: undefined },
};

/** The gate behind you: the mark fills once it is no longer the one being played. */
export const AGateAlreadyCleared: Story = {
	args: {
		label: "Next gate",
		note: "Boulder gate opens tomorrow",
		swatch: { state: "discovered", swatch: PALLET },
	},
};

/** A press that carries no gate wears where it leads: the shop stands outside the climb. */
export const OutsideARun: Story = {
	args: {
		label: "To the shop",
		note: "296 KB stored",
		swatch: undefined,
		icon: "shop",
	},
};

/** Nothing to mark it with at all: the label takes the slot. */
export const Unmarked: Story = {
	args: { label: "Start a run", note: "5 polls a day", swatch: undefined },
};

/** The ink is half of a contrast pair, so the loudest hue has to read as well as the palest. */
export const TheLoudestHue: Story = {
	args: {
		label: `${VOLCANO.gateName} gate prep`,
		swatch: { state: "current", swatch: VOLCANO },
	},
	render: (args) => (
		<Screen gate={VOLCANO.theme} width="narrow" ground="bare">
			<Action {...args} />
		</Screen>
	),
};
