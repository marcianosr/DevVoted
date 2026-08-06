import type { Meta, StoryObj } from "@storybook/react";
import { SLOT_SWATCHES } from "~/modules/run/pipeline/swatch.model";
import { SlotSwatchRow } from "./SlotSwatchRow.ui";

// Each slot unlock is a collectible gym-badge swatch: the row turns "add a
// slot" from a utility button into a goal the player chases gate over gate.
const meta: Meta<typeof SlotSwatchRow> = {
	component: SlotSwatchRow,
	title: "Run/SlotSwatchRow",
};
export default meta;

type Story = StoryObj<typeof SlotSwatchRow>;

// Coverage still short of the gate: no button — the bar carries the story.
export const Locked: Story = {
	args: {
		swatch: SLOT_SWATCHES[4],
		unlockAtPct: 8,
		coveragePct: 5.5,
		opensGate: 2,
		claim: { ready: false, onClaim: () => {} },
	},
};

// The gate is met: the free claim pill appears.
export const Claimable: Story = {
	args: {
		swatch: SLOT_SWATCHES[4],
		unlockAtPct: 8,
		coveragePct: 9.2,
		opensGate: 2,
		claim: { ready: true, onClaim: () => {} },
	},
};

// The configuring screen's read-only preview: a lock pill instead of a button.
export const ReadOnly: Story = {
	args: {
		swatch: SLOT_SWATCHES[5],
		unlockAtPct: 16,
		coveragePct: 9.2,
		opensGate: 3,
	},
};

// The final slot, which opens the summit: the Elite Four has no flat Kanto
// color, so chip and unlock pill wear the legendary gradient ring.
export const EliteFour: Story = {
	args: {
		swatch: SLOT_SWATCHES[14],
		unlockAtPct: 415,
		coveragePct: 420,
		opensGate: 12,
		claim: { ready: true, onClaim: () => {} },
	},
};
