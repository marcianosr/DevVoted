import type { Meta, StoryObj } from "@storybook/react";

import { GATE_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

import { Action } from "./Action.ui";
import { Screen } from "./Screen.ui";
import { PressSwatch } from "~/modules/run/gate/presentation/Swatch.ui";

const PALLET = GATE_SWATCHES[0];
const CINNABAR = GATE_SWATCHES[9];

const noop = () => undefined;

const meta: Meta<typeof Action> = {
	component: Action,
	title: "Kanto/Action",
	args: {
		label: `${PALLET.gateName} gate prep`,
		note: "2 configs · 3/4 weight",
		leading: (
			<PressSwatch
				mark={{ state: "current", swatch: PALLET }}
				refused={false}
			/>
		),
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
	args: {
		note: "install at least one config",
		leading: (
			<PressSwatch mark={{ state: "current", swatch: PALLET }} refused />
		),
		onPress: undefined,
	},
};

export const CommittingAnAnswer: Story = {
	args: { label: "Lock in", note: "answer C" },
};

export const NothingPicked: Story = {
	args: { label: "Lock in", note: "pick an answer first", onPress: undefined },
};

export const AGateAlreadyCleared: Story = {
	args: {
		label: "Next gate",
		note: "Pewter gate opens tomorrow",
		leading: (
			<PressSwatch
				mark={{ state: "discovered", swatch: PALLET }}
				refused={false}
			/>
		),
	},
};

export const OutsideARun: Story = {
	args: {
		label: "To the shop",
		note: "296 KB stored",
		leading: undefined,
		icon: "shop",
	},
};

export const FillsAnEmptySlot: Story = {
	args: {
		label: "Wear the title",
		note: undefined,
		leading: undefined,
		mark: "dashed",
	},
};

export const Unmarked: Story = {
	args: { label: "Start a run", note: "5 polls a day", leading: undefined },
};

export const TheLoudestHue: Story = {
	args: {
		label: `${CINNABAR.gateName} gate prep`,
		leading: (
			<PressSwatch
				mark={{ state: "current", swatch: CINNABAR }}
				refused={false}
			/>
		),
	},
	render: (args) => (
		<Screen gate={CINNABAR.theme} width="narrow" ground="bare">
			<Action {...args} />
		</Screen>
	),
};
