import type { Meta, StoryObj } from "@storybook/react";
import {
	ALL_SWATCHES,
	SLOT_SWATCHES,
} from "~/modules/run/pipeline/swatch.model";
import { SwatchChips } from "./SwatchChips.ui";

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
		swatches: [SLOT_SWATCHES[4], SLOT_SWATCHES[5], SLOT_SWATCHES[6]],
	},
};

// The dex: the full ladder, unearned entries redacted.
export const CollectionInProgress: Story = {
	args: {
		swatches: ALL_SWATCHES,
		ownedIds: [SLOT_SWATCHES[4].id, SLOT_SWATCHES[5].id],
		redactLocked: true,
	},
};

// Every swatch collected, Elite Four included.
export const Complete: Story = {
	args: {
		swatches: ALL_SWATCHES,
		ownedIds: ALL_SWATCHES.map(({ id }) => id),
	},
};
