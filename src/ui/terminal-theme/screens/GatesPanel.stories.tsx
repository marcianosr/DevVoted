import type { Meta, StoryObj } from "@storybook/react";

import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";
import { coverageDemandFor } from "~/modules/run/run/domain/rules.model";

import { Panel } from "../Panel.ui";
import { GatesPanel, type DexGate } from "./GatesPanel.ui";

const CLEARED_THROUGH = 7;

/** Best coverage ever scored at each gate. Gates 0–7 went down; gate 8 has been
 * stood at and not beaten, which is the only place a best score sits under its
 * demand. */
const BEST: Readonly<Record<number, number>> = {
	0: 94,
	1: 88,
	2: 71,
	3: 66,
	4: 63,
	5: 98,
	6: 121,
	7: 152,
	8: 128,
};

export const dexGates: readonly DexGate[] = ALL_SWATCHES.map(
	(swatch): DexGate => {
		// A gate's demand is the coverage asked of someone who has cleared every
		// gate below it, so the gate number is the argument.
		const demand = coverageDemandFor(swatch.gate);
		const best = BEST[swatch.gate];
		if (best === undefined) return { gate: swatch.gate, demand, locked: true };

		return {
			gate: swatch.gate,
			demand,
			name: swatch.gateName,
			theme: swatch.theme,
			finish: swatch.finish,
			best,
			cleared: swatch.gate <= CLEARED_THROUGH,
		};
	}
);

const meta: Meta<typeof GatesPanel> = {
	component: GatesPanel,
	title: "Terminal/Screens/Dex/Gates",
	// Storybook reads every named export as a story, so the data other story
	// files import has to be named here or it renders as a story with no args.
	excludeStories: ["dexGates"],
	parameters: { layout: "fullscreen" },
	decorators: [
		(Story) => (
			<div className="min-h-screen bg-zinc-900 p-6">
				<Panel>
					<Story />
				</Panel>
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof GatesPanel>;

export const StandingAtGateEight: Story = { args: { gates: dexGates } };

/** Every gate but Pallet is still a dashed card, and the demand ladder is the
 * whole page: 3 to 340. */
export const FirstRun: Story = {
	args: {
		gates: ALL_SWATCHES.map((swatch): DexGate =>
			swatch.gate === 0
				? {
						gate: 0,
						demand: coverageDemandFor(0),
						name: swatch.gateName,
						theme: swatch.theme,
						finish: swatch.finish,
						best: 2,
						cleared: false,
					}
				: {
						gate: swatch.gate,
						demand: coverageDemandFor(swatch.gate),
						locked: true,
					}
		),
	},
};

/** The summit pair drawn: Elite wears a rim so indigo reads against the page,
 * and the Champion has no flat colour at all. */
export const EveryGateCleared: Story = {
	args: {
		gates: ALL_SWATCHES.map((swatch): DexGate => ({
			gate: swatch.gate,
			demand: coverageDemandFor(swatch.gate),
			name: swatch.gateName,
			theme: swatch.theme,
			finish: swatch.finish,
			best: coverageDemandFor(swatch.gate) + 12,
			cleared: true,
		})),
	},
};

export const Mobile: Story = {
	...StandingAtGateEight,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px] bg-zinc-900 p-3">
				<Panel>
					<Story />
				</Panel>
			</div>
		),
	],
};
