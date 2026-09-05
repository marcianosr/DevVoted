import type { Meta, StoryObj } from "@storybook/react";

import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

import { Panel } from "../Panel.ui";
import { SwatchesPanel, type DexSwatch } from "./SwatchesPanel.ui";

/** Clearing a gate awards its swatch, so this is the same eight the Gates tab
 * ticks — gates 0–7, Pallet through Marsh. */
const EARNED_BELOW = 8;

/** The gate's own name, not the swatch's: "Pallet Swatch" under a paint chip on
 * the Swatches tab says the word twice. */
export const dexSwatches: readonly DexSwatch[] = ALL_SWATCHES.map(
	(swatch): DexSwatch =>
		swatch.gate < EARNED_BELOW
			? {
					id: swatch.id,
					name: swatch.gateName,
					theme: swatch.theme,
					finish: swatch.finish,
				}
			: { id: swatch.id, earned: false }
);

const meta: Meta<typeof SwatchesPanel> = {
	component: SwatchesPanel,
	title: "Terminal/Screens/Dex/Swatches",
	// Storybook reads every named export as a story, so the data other story
	// files import has to be named here or it renders as a story with no args.
	excludeStories: ["dexSwatches"],
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
type Story = StoryObj<typeof SwatchesPanel>;

export const EightEarned: Story = { args: { swatches: dexSwatches } };

export const NoneEarned: Story = {
	args: {
		swatches: ALL_SWATCHES.map((swatch): DexSwatch => ({
			id: swatch.id,
			earned: false,
		})),
	},
};

/** The full set, which is the only place Elite's rim and the Champion's
 * gradient are visible at all. */
export const TheWholeShelf: Story = {
	args: {
		swatches: ALL_SWATCHES.map((swatch): DexSwatch => ({
			id: swatch.id,
			name: swatch.gateName,
			theme: swatch.theme,
			finish: swatch.finish,
		})),
	},
};

export const Mobile: Story = {
	...EightEarned,
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
