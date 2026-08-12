import type { Meta, StoryObj } from "@storybook/react";
import {
	ALL_SWATCHES,
	GATE_SWATCHES,
} from "~/modules/run/gate/domain/swatch.model";
import { SwatchChips } from "~/modules/run/gate/presentation/SwatchChips.ui";

// The collection payoff: swatches are kept forever, so seeing the earned ones
// lit beside the ones still to come is what makes widening feel like progress.
const meta: Meta<typeof SwatchChips> = {
	component: SwatchChips,
	title: "Run/SwatchChips",
};
export default meta;

type Story = StoryObj<typeof SwatchChips>;

// What a run shows: only the swatches it has actually earned.
export const EarnedThisRun: Story = {
	args: {
		swatches: [GATE_SWATCHES[1], GATE_SWATCHES[2], GATE_SWATCHES[3]],
	},
};

// The dex: the full ladder, unearned entries redacted.
export const CollectionInProgress: Story = {
	args: {
		swatches: ALL_SWATCHES,
		ownedIds: [GATE_SWATCHES[1].id, GATE_SWATCHES[2].id],
		redactLocked: true,
	},
};

// Every swatch collected, the Champion included.
export const Complete: Story = {
	args: {
		swatches: ALL_SWATCHES,
		ownedIds: ALL_SWATCHES.map(({ id }) => id),
	},
};
